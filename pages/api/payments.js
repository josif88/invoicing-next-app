import prisma from "../../utils/db";
import { notfoundRes, okRes } from "../../utils/response";
import { nameSearch, verifyAdmin } from "./middleware";

const handler = async (req, res) => {
  if (req.method.toLowerCase() === "get") {
    const { where } = req.options;

    const payments = await prisma.payment.findMany({
      ...req.options,

      include: {
        customer: true,
        createdBy: true,
        invoice: true,
      },
    });
    let count = await prisma.payment.count({ where });

    return okRes(res, { payments, count });
  } else {
    return notfoundRes(res);
  }
};

export default verifyAdmin(nameSearch(handler));
