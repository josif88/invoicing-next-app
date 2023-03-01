// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";

import { verifyAdmin } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "get": {
      const productId = Number.parseInt(req.query.p);
      try {
        const result =
          await prisma.$queryRaw`Select "INVENTORY_SUMS".sum From "INVENTORY_SUMS" Where "INVENTORY_SUMS"."productId" = ${productId}`;

        return okRes(res, result[0].sum);
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
