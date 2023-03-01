import pdf from "pdf-creator-node";
import fs from "fs";
import prisma from "../../../../utils/db";
import { errorRes, notfoundRes } from "../../../../utils/response";
import writtenNumber from "written-number";
import moment from "moment";

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
      footer: {
        height: "3mm",
        contents: {
          default: `
          <div style="direction:rtl;">            
          <div>برمجة وتطوير <strong>يوسف باسم</strong>            
          هاتف واتس اب: 07702992001 
          </div>
          </div>
          `,
        },
      },
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
        customerDebt: customerDebt.toLocaleString(),
        date: moment(payment.createdAt).format("YYYY/MM/DD"),
      },
      type: "buffer",
    };

    const buffer = await pdf.create(document, options);

    res.setHeader(
      "Content-disposition",
      'inline; filename="' + "p" + payment.id + ".pdf"
    );
    res.setHeader("Content-type", "application/pdf");
    res.end(buffer);
  } catch (e) {
    console.log(e);
    res.end(e.toString());
  }
};

export default handler;
