// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../utils/db";
import { errorRes, okRes } from "../../utils/response";
import { limit } from "./middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "get": {
      try {
        const inventoryRecords = await prisma.inventory.findMany({
          where: {
            productId: Number.parseInt(req.query.productId),
          },
          ...req.options,
        });

        const count = await prisma.inventory.count({
          where: {
            productId: Number.parseInt(req.query.productId),
          },
        });

        return okRes(res, { inventoryRecords, count });
      } catch (e) {
        console.log(e);
        return errorRes(res, "inventory error");
      }
    }

    default: {
      return res.status(200).json({ message: "get Method only" });
    }
  }
};

export default limit(handler);
