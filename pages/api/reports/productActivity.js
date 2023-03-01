// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "get": {
      let { product, start = "1970-01-01", end, order = "DESC" } = req.query;

      let queryString = `
      Select
      "PRODUCT_ACTIVITY"."productId",
      "PRODUCT_ACTIVITY".status,
      "PRODUCT_ACTIVITY".value,
      "PRODUCT_ACTIVITY"."invoiceId",
      "PRODUCT_ACTIVITY"."customerId",
      "PRODUCT_ACTIVITY"."adminId",
      "PRODUCT_ACTIVITY"."customerName",
      "PRODUCT_ACTIVITY"."sallerName",
      "PRODUCT_ACTIVITY"."date"
      From
      "PRODUCT_ACTIVITY" 
      `;

      queryString = `${queryString} Where "PRODUCT_ACTIVITY"."date" >= '${start}'
      `;

      if (end) {
        queryString = `${queryString} and "PRODUCT_ACTIVITY"."date" <= '${end}' `;
      }

      if (product) {
        queryString = `${queryString} and "PRODUCT_ACTIVITY"."productId" = ${product}`;
      }

      queryString = `${queryString} Order By "PRODUCT_ACTIVITY"."date" ${order}`;

      let quantityBeforeDate = null;

      if (start !== "1970-01-01") {
        let beforeDateDebtSumQuery = `Select Sum("PRODUCT_ACTIVITY".value) As "value" From "PRODUCT_ACTIVITY" where "PRODUCT_ACTIVITY".date < '${start}' `;
        if (product) {
          beforeDateDebtSumQuery = `${beforeDateDebtSumQuery} and "PRODUCT_ACTIVITY"."productId" = ${product}`;
        }
        quantityBeforeDate = await prisma.$queryRawUnsafe(
          beforeDateDebtSumQuery
        );
      }
      try {
        const result = await prisma.$queryRawUnsafe(queryString);

        if (quantityBeforeDate) {
          return okRes(res, [
            {
              date: null,
              note: "الرصيد الافتتاحي",
              type: "الكمية السابقة",
              value: quantityBeforeDate[0].value || 0,
            },
            ...result,
          ]);
        } else {
          return okRes(res, result);
        }
      } catch (e) {
        console.log(e);
        return errorRes(res, "error");
      }
    }

    default: {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export default handler;
