import pdf from "pdf-creator-node";
import fs from "fs";
import prisma from "../../../../utils/db";
import { errorRes, notfoundRes } from "../../../../utils/response";

const handler = async (req, res) => {
  try {
    const orderId = req.query.id;

    if (!orderId) {
      return errorRes(res, "لا يوجد معرف");
    }

    const order = await prisma.order.findFirst({
      where: {
        id: Number.parseInt(orderId),
      },
      include: {
        orderItem: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    if (!order) {
      return notfoundRes(res);
    }

    let itemsCount = 0;

    for (let i = 0; i < order.orderItem.length; i++) {
      itemsCount = itemsCount + order.orderItem[i].quantity;
    }

    order.phoneNumber = "0" + order.phoneNumber.substr(4);

    let html = fs.readFileSync("orderPdfTemplate.html", "utf8");
    let document = {
      html: html.toString(),
      data: {
        order,
        orderItem: order.orderItem,
        itemsCount,
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
      'inline; filename="' + "i" + order.id + ".pdf"
    );
    res.setHeader("Content-type", "application/pdf");
    return res.send(buffer);
  } catch (e) {
    console.log(e);
    res.end(e.toString());
  }
};

export default handler;
