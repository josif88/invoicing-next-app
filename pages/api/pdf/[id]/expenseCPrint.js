import pdf from "pdf-creator-node";
import fs from "fs";
import prisma from "../../../../utils/db";
import writtenNumber from "written-number";
import moment from "moment";
import transporter from "../../../../utils/mailService";
import { errorRes, notfoundRes, okRes } from "../../../../utils/response";

const handler = async (req, res) => {
  try {
    const expenseId = req.query.id;
    if (!expenseId) {
      return errorRes(res, "لا يوجد معرف");
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id: Number.parseInt(expenseId),
      },
      include: {
        admin: true,
      },
    });

    if (!expense) {
      return notfoundRes(res);
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

    let html = fs.readFileSync("expensePdfTemplate.html", "utf8");
    let document = {
      html: html,
      data: {
        writtenNumber: writtenNumber(expense.value, {
          lang: "ar",
        }),
        expense: expense,
        value: expense.value.toLocaleString(),
        date: moment(expense.createdAt).format("YYYY/MM/DD"),
      },
      type: "buffer",
    };

    const buffer = await pdf.create(document, options);

    let info = await transporter.sendMail({
      from: process.env.EMAIL_ADDRESS, // sender address
      to: [process.env.EPRINT_ADDRESS, process.env.EMAIL_ADDRESS], // list of receivers
      subject: `سند صرف بالرقم ${expense.id}`, // Subject line
      text: "", // plain text body
      html: "", // html body
      attachments: [
        {
          filename: `e${expense.id}.pdf`,
          content: buffer,
        },
      ],
    });

    return okRes(
      res,
      `expense document #${expense.id} has been emailed to printer`
    );
  } catch (e) {
    console.log(e);
    return errorRes(res, "expense document no sent to printer");
  }
};

export default handler;
