// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "get": {
      const customerId = req.query.id;
      if (!customerId) {
        return errorRes(res, "لا يوجد معرف");
      }

      try {
        const debt = await prisma.$queryRaw`Select
            "CUSTOMER_CREDIT_ACTIVITY"."customerId" As id,
            Sum("CUSTOMER_CREDIT_ACTIVITY".value) As debt
            From
            "CUSTOMER_CREDIT_ACTIVITY"
            Where
            "CUSTOMER_CREDIT_ACTIVITY"."customerId" = ${Number.parseInt(
              customerId
            )}
            Group By
            "CUSTOMER_CREDIT_ACTIVITY"."customerId"`;
        await prisma.$disconnect();

        if (debt) return okRes(res, debt[0].debt);
        else return errorRes(res, "error");
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
