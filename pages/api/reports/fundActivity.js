// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import moment from "moment";
import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "get": {
      let { start = "1970-01-01", end, order = "DESC" } = req.query;

      let queryString = `
      Select
      "FUND_ACTIVITY"."documentId",
      "FUND_ACTIVITY"."date",
      "FUND_ACTIVITY"."value",
      "FUND_ACTIVITY".type,
      "FUND_ACTIVITY"."issuedBy",
      "FUND_ACTIVITY"."issuedTo",
      "FUND_ACTIVITY".category,
      "FUND_ACTIVITY".note
      From
      "FUND_ACTIVITY"     
      `;

      queryString = `${queryString} Where "FUND_ACTIVITY"."date" >= '${start}'
      `;

      if (end) {
        queryString = `${queryString} and "FUND_ACTIVITY"."date" <= '${end}' `;
      }

      queryString = `${queryString} Order By "FUND_ACTIVITY"."date" ${order}`;

      try {
        const result = await prisma.$queryRawUnsafe(queryString);
        return okRes(res, result);
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
