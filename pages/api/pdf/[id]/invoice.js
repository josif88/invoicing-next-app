import pdf from "pdf-creator-node";
import fs from "fs";
import prisma from "../../../../utils/db";
import { errorRes, notfoundRes } from "../../../../utils/response";
import writtenNumber from "written-number";
import moment from "moment";

const handler = async (req, res) => {
  try {
    const invoiceId = req.query.id;

    if (!invoiceId) {
      return errorRes(res, "لا يوجد معرف");
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: Number.parseInt(invoiceId),
      },
      include: {
        invoiceItem: {
          include: {
            product: true,
          },
        },
        customer: true,
        createdBy: true,
      },
    });

    if (!invoice) {
      return notfoundRes(res);
    }

    let customerDebt = 0;
    //correcting customer name and get his debt if available
    if (!invoice.customer) {
      invoice.customer = { name: "عميل نقدي" };
    } else {
      const debt = await prisma.$queryRaw`Select
            "CUSTOMER_CREDIT_ACTIVITY"."customerId" As id,
            Sum("CUSTOMER_CREDIT_ACTIVITY".value) As debt
            From
            "CUSTOMER_CREDIT_ACTIVITY"
            Where
            "CUSTOMER_CREDIT_ACTIVITY"."customerId" = ${Number.parseInt(
              invoice.customerId
            )}
            Group By
            "CUSTOMER_CREDIT_ACTIVITY"."customerId"`;

      if (debt.length > 0) {
        customerDebt = debt[0].debt;
      }
    }

    let itemsCount = 0;
    for (let i = 0; i < invoice.invoiceItem.length; i++) {
      itemsCount = itemsCount + invoice.invoiceItem[i].quantity;
    }

    let html = fs.readFileSync("invoicePdfTemplate.html", "utf8");
    let document = {
      html: html.toString(),
      data: {
        invoiceItem: invoice.invoiceItem,
        total: invoice.total.toLocaleString(),
        writtenTotal: writtenNumber(invoice.total, {
          lang: "ar",
        }),
        itemsCount,
        invoice,
        date: moment(invoice.createdAt).format("YYYY/MM/DD"),
        time: moment(invoice.createdAt).format("hh:mm A"),
        customerDebt: customerDebt.toLocaleString(),
        oldDebt: (customerDebt - invoice.total).toLocaleString(),
        invoiceType: invoice.isReturn
          ? "فاتورة استرجاع"
          : invoice.onCredit
          ? "فاتورة بيع آجل"
          : "فاتورة بيع نقدي",
      },
      type: "buffer",
    };

    let options = {
      format: "A4",
      orientation: "portrait",
      border: "10mm",
      footer: {
        height: "10mm",
        contents: {
          default: `
                    <div style="direction:rtl;">
                    <div style="width:100%;text-align:center;">                
                    <span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>
                    </div>                    
                    <div>برمجة وتطوير <strong>يوسف باسم</strong>            
                    هاتف واتس اب: 07702992001 
                    </div>
                    </div>
                    `,
        },
      },
    };

    let buffer = await pdf.create(document, options);

    res.setHeader(
      "Content-disposition",
      'inline; filename="' + "i" + invoice.id + ".pdf"
    );
    res.setHeader("Content-type", "application/pdf");
    return res.send(buffer);
  } catch (e) {
    console.log(e);
    res.end(e.toString());
  }
};

export default handler;
