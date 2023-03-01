// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";
import { inventorySchema } from "../../../utils/valdations";

import { verifyAdmin } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "post": {
      const inventoryData = req.body;
      try {
        //validation
        const valid = await inventorySchema.validate(inventoryData);
        const category = await prisma.inventory.create({ data: valid });

        return okRes(res, category);
      } catch (e) {
        return errorRes(res, e.errors);
      }
    }

    default: {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export default verifyAdmin(handler);
