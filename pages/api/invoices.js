import prisma from "../../utils/db";
import { notfoundRes, okRes } from "../../utils/response";
import { nameSearch, verifyAdmin } from "./middleware";

const handler = async (req, res) => {
  if (req.method.toLowerCase() === "get") {
    let { where } = req.options;

    const invoices = await prisma.invoice.findMany({
      ...req.options,

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

    const count = await prisma.invoice.count({ where });

    return okRes(res, { invoices, count });
  } else {
    return notfoundRes(res);
  }
};

export default verifyAdmin(nameSearch(handler));
