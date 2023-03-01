import pdf from "pdf-creator-node";
import fs from "fs";
import prisma from "../../../../utils/db";
import writtenNumber from "written-number";
import moment from "moment";
import transporter from "../../../../utils/mailService";
import { errorRes, notfoundRes, okRes } from "../../../../utils/response";

const handler = async (req, res) => {
  try {
    const paymentId = req.query.id;
    if (!paymentId) {
      return errorRes(res, "لا يوجد معرف");
    }

    const payment = await prisma.payment.findFirst({
      where: {
        id: Number.parseInt(paymentId),
      },
      include: {
        customer: true,
        createdBy: true,
      },
    });

    if (!payment) {
      return notfoundRes(res);
    }
    if (!payment.invoiceId) {
      payment.invoiceId = "غير محدده";
    }

    let customerDebt = 0;
    //correcting customer name and get his debt if available
    if (!payment.customer) {
      payment.customer = { name: "عميل نقدي" };
    } else {
      const debt = await prisma.$queryRaw`Select
      "CUSTOMER_CREDIT_ACTIVITY"."customerId" As id,
      Sum("CUSTOMER_CREDIT_ACTIVITY".value) As debt
      From
      "CUSTOMER_CREDIT_ACTIVITY"
      Where
            "CUSTOMER_CREDIT_ACTIVITY"."customerId" = ${Number.parseInt(
              payment.customerId
            )}
              Group By
              "CUSTOMER_CREDIT_ACTIVITY"."customerId"`;
      if (debt.length > 0) {
        customerDebt = debt[0].debt;
      }
    }

    let options = {
      format: "A4",
      orientation: "portrait",
      border: "10mm",
    };

    let html = fs.readFileSync("paymentPdfTemplate.html", "utf8");
    let document = {
      html: html,
      data: {
        writtenNumber: writtenNumber(payment.value, {
          lang: "ar",
        }),
        payment,
        value: payment.value.toLocaleString(),
        customerDebt: customerDebt,
        date: moment(payment.createdAt).format("YYYY/MM/DD"),
      },
      type: "buffer",
    };

    const buffer = await pdf.create(document, options);

    let info = await transporter.sendMail({
      from: process.env.EMAIL_ADDRESS, // sender address
      to: [process.env.EPRINT_ADDRESS, process.env.EMAIL_ADDRESS], // list of receivers
      subject: `مقبوضات السيد ${payment.customer.name} بالرقم ${payment.id}`, // Subject line
      text: "", // plain text body
      html: "", // html body
      attachments: [
        {
          filename: `p${payment.id}.pdf`,
          content: buffer,
        },
      ],
    });

    return okRes(res, `payment #${payment.id} has been emailed to printer`);
  } catch (e) {
    console.log(e);
    return errorRes(res, "payment no sent to printer");
  }
};

export default handler;
