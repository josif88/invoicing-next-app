import prisma from "../../utils/db";
import { notfoundRes, okRes } from "../../utils/response";
import { nameSearch, verifyAdmin } from "./middleware";

const handler = async (req, res) => {
  const { where } = req.options;

  if (req.method.toLowerCase() === "get") {
    const orders = await prisma.order.findMany({
      ...req.options,
      include: {
        orderItem: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    const count = await prisma.order.count({ where });
    return okRes(res, { orders: orders, count });
  } else {
    return notfoundRes(res);
  }
};

export default verifyAdmin(nameSearch(handler));
