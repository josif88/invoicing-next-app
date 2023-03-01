// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "get": {
      let { customer, start = "1970-01-01", end, order = "ASC" } = req.query;

      let queryString = `Select "CUSTOMER_ACTIVITY".id,"CUSTOMER_ACTIVITY".active,"CUSTOMER_ACTIVITY".value,"CUSTOMER_ACTIVITY"."date","CUSTOMER_ACTIVITY".note,"CUSTOMER_ACTIVITY"."documentId","CUSTOMER_ACTIVITY".type,"CUSTOMER_ACTIVITY".credit From "CUSTOMER_ACTIVITY" `;

      queryString = `${queryString} Where "CUSTOMER_ACTIVITY".date >= '${start}'
      `;

      if (end) {
        queryString = `${queryString} and "CUSTOMER_ACTIVITY".date <= '${end}' `;
      }
      if (customer) {
        queryString = `${queryString} and "CUSTOMER_ACTIVITY".id = ${customer}`;
      }

      queryString = `${queryString} Order By "CUSTOMER_ACTIVITY"."date" ${order}`;

      let debt = null;

      if (start !== "1970-01-01") {
        let beforeDateDebtSumQuery = `Select Sum("CUSTOMER_ACTIVITY".value) As "value" From "CUSTOMER_ACTIVITY" where "CUSTOMER_ACTIVITY".date < '${start}' `;
        if (customer) {
          beforeDateDebtSumQuery = `${beforeDateDebtSumQuery} and "CUSTOMER_ACTIVITY".id = ${customer}`;
        }
        debt = await prisma.$queryRawUnsafe(beforeDateDebtSumQuery);
      }

      try {
        const result = await prisma.$queryRawUnsafe(queryString);
        if (debt) {
          return okRes(res, [
            {
              date: null,
              note: "الرصيد الافتتاحي",
              type: "المديوينة السابقة",
              value: debt[0].value,
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
