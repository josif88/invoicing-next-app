// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, notfoundRes, okRes } from "../../../utils/response";
import { productSchema } from "../../../utils/valdations";

import { writeAuth } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "put": {
      try {
        const productId = Number.parseInt(req.query.id);
        if (!productId) {
          return errorRes(res, "رقم المنتج غير موجود");
        }
        const productData = req.body;
        const valid = await productSchema.validate(productData);
        const product = await prisma.product.update({
          where: {
            id: productId,
          },
          data: valid,
        });

        return okRes(res, { date: product });
      } catch (e) {
        return errorRes(res, e.errors);
      }
    }
    case "delete": {
      try {
        const productId = Number.parseInt(req.query.id);
        if (!productId) {
          return errorRes(res, "رقم المنتج غير موجود");
        }
        const product = await prisma.product.update({
          where: {
            id: productId,
          },
          data: { active: false },
        });
        //validation
        return okRes(res, { date: product });
      } catch (e) {
        console.log(e);
        return errorRes(res, e);
      }
    }

    case "get": {
      const productId = req.query.id;
      if (!productId) {
        return errorRes(res, "لا يوجد معرف");
      }
      const product = await prisma.product.findFirst({
        where: {
          id: Number.parseInt(productId),
        },
      });

      if (!product) {
        return notfoundRes(res);
      }

      return okRes(res, { ...product });
    }
    default: {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export default writeAuth(handler);
