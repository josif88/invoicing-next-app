import prisma from "../../utils/db";
import { notfoundRes, okRes } from "../../utils/response";
import { pagination } from "./middleware";

const handler = async (req, res) => {
  let { where, ...restOptions } = req.options;
  where = {
    customer: {
      referenceCode: req.query.ref,
    },
  };

  console.log(where);
  if (req.method.toLowerCase() === "get") {
    const orders = await prisma.order.findMany({
      ...restOptions,
      where,
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

export default pagination(handler);
