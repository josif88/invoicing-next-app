import pdf from "pdf-creator-node";
import fs from "fs";
import prisma from "../../../../utils/db";
import { errorRes, notfoundRes } from "../../../../utils/response";
import writtenNumber from "written-number";
import moment from "moment";

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

    res.setHeader(
      "Content-disposition",
      'inline; filename="' + "e" + expense.id + ".pdf"
    );
    res.setHeader("Content-type", "application/pdf");
    res.end(buffer);
  } catch (e) {
    console.log(e);
    res.end(e.toString());
  }
};

export default handler;
