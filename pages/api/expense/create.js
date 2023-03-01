// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";
import { expenseSchema } from "../../../utils/valdations";
import { verifyAdmin } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "post": {
      const expenseData = req.body;

      try {
        //validation
        const valid = await expenseSchema.validate(expenseData);
        const expense = await prisma.expense.create({ data: expenseData });
        return okRes(res, expense);
      } catch (e) {
        console.log(e);
        return errorRes(res, e.errors);
      }
    }

    default: {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export default verifyAdmin(handler);
