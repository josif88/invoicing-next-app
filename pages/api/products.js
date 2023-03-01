// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../utils/db";
import { okRes } from "../../utils/response";
import { pagination } from "./middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "get": {
      const { where } = req.options;
      const products = await prisma.product.findMany({
        include: {
          category: true,
        },
        ...req.options,
      });

      const count = await prisma.product.count({ where });
      return okRes(res, { products, count });
    }
    default: {
      return res.status(200).json({ message: "get Method only" });
    }
  }
};

export default pagination(handler);
