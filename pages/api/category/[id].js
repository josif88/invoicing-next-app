// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { generate } from "randomstring";
import prisma from "../../../utils/db";
import { errorRes, notfoundRes, okRes } from "../../../utils/response";
import { categorySchema } from "../../../utils/valdations";

import { verifyAdmin, writeAuth } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "put": {
      try {
        const categoryId = Number.parseInt(req.query.id);
        if (!categoryId) {
          return errorRes(res, "رقم الصنف غير موجود");
        }
        const categoryData = req.body;
        const valid = await categorySchema.validate(categoryData);
        const category = await prisma.category.update({
          where: {
            id: categoryId,
          },
          data: valid,
        });

        return okRes(res, { date: category });
      } catch (e) {
        return errorRes(res, e.errors);
      }
    }
    case "delete": {
      try {
        const categoryId = Number.parseInt(req.query.id);
        if (!categoryId) {
          return errorRes(res, "رقم الصنف غير موجود");
        }
        const category = await prisma.category.update({
          where: {
            id: categoryId,
          },
          data: {
            active: false,
          },
        });

        return okRes(res, { date: category });
      } catch (e) {
        return errorRes(res, e);
      }
    }

    case "get": {
      const categoryId = req.query.id;
      if (!categoryId) {
        return errorRes(res, "لا يوجد معرف");
      }
      const category = await prisma.category.findFirst({
        where: {
          id: Number.parseInt(categoryId),
        },
      });

      if (!category) {
        return notfoundRes(res);
      }

      return okRes(res, { category });
    }
    default: {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export default writeAuth(handler);
