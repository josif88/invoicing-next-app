import pdf from "pdf-creator-node";
import fs from "fs";
import transporter from "../../../../utils/mailService";
import prisma from "../../../../utils/db";
import { errorRes, notfoundRes, okRes } from "../../../../utils/response";

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
    };

    let buffer = await pdf.create(document, options);

    let info = await transporter.sendMail({
      from: process.env.EMAIL_ADDRESS, // sender address
      to: [process.env.EPRINT_ADDRESS, process.env.EMAIL_ADDRESS], // list of receivers
      subject: `طلب السيد ${order.customer.name} بالرقم ${order.id}`, // Subject line
      text: "", // plain text body
      html: "", // html body
      attachments: [
        {
          filename: `o${order.id}.pdf`,
          content: buffer,
        },
      ],
    });

    return okRes(res, `order #${order.id} has been emailed to printer`);
  } catch (e) {
    console.log(e);
    return errorRes(res, "order no sent to printer");
  }
};

export default handler;
