import prisma from "../../utils/db";
import { notfoundRes, okRes } from "../../utils/response";
import { expensesOptions, nameSearch, verifyAdmin } from "./middleware";

const handler = async (req, res) => {
  if (req.method.toLowerCase() === "get") {
    const { where } = req.options;

    const expenses = await prisma.expense.findMany({
      ...req.options,

      include: {
        admin: true,
      },
    });
    let count = await prisma.expense.count({ where });

    return okRes(res, { expenses, count });
  } else {
    return notfoundRes(res);
  }
};

export default verifyAdmin(expensesOptions(handler));
