// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../utils/db";
import { okRes } from "../../utils/response";
import { pagination } from "./middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "get": {
      const categories = await prisma.category.findMany(req.options);
      return okRes(res, categories);
    }
    default: {
      return res.status(200).json({ message: "get Method only" });
    }
  }
};

export default pagination(handler);
