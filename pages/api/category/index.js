// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";
import { categorySchema } from "../../../utils/valdations";

import { writeAuth } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "post": {
      const categoryData = req.body;
      try {
        //validation
        const valid = await categorySchema.validate(categoryData);
        const category = await prisma.category.create({ data: valid });

        return okRes(res, category);
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
