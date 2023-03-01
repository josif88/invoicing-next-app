// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, notfoundRes, okRes } from "../../../utils/response";
import { expenseSchema } from "../../../utils/valdations";
import { writeAuth } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "put": {
      const expenseData = req.body;
      const { admin, ...restBody } = expenseData;
      const expenseId = Number.parseInt(req.query.id);

      try {
        //make sure of entries
        const valid = await expenseSchema.validate(restBody);

        // find the invoice
        const expense = await prisma.expense.findFirst({
          where: {
            id: expenseId,
          },
        });

        if (!expense) return errorRes(res, "لم يتم العثور على الفاتورة");

        const updatedExpense = await prisma.expense.update({
          where: {
            id: expenseId,
          },
          data: {
            ...valid,
          },
        });

        return okRes(res, updatedExpense);
      } catch (e) {
        console.log(e);
        return errorRes(res, e.errors);
      }
    }
    case "delete": {
      const expenseId = Number.parseInt(req.query.id);

      try {
        const deleteExpense = prisma.expense.delete({
          where: {
            id: expenseId,
          },
        });

        const transaction = await prisma.$transaction([deleteExpense]);
        return okRes(res, { date: transaction });
      } catch (e) {
        return errorRes(res, e.errors);
      }
    }

    case "get": {
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
      return okRes(res, expense);
    }
    default: {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export default writeAuth(handler);
