// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";
import { productSchema } from "../../../utils/valdations";
import { writeAuth } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "post": {
      const productData = req.body;
      try {
        //validation
        const valid = await productSchema.validate(productData);
        const product = await prisma.product.create({ data: valid });
        return okRes(res, product);
      } catch (e) {
        //validation message

        return errorRes(res, e.errors);
      }
    }

    default: {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export default writeAuth(handler);
