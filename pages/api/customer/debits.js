// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { Prisma } from ".prisma/client";
import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";
import { pagination, verifyAdmin } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "get": {
      const options = req.options;
      if (options.where.name) {
        try {
          let q = options.where.name.contains;
          const debits = await prisma.$queryRawUnsafe(
            `SELECT
					customer."id",
						customer.phone,
						customer."name",
						customer."location",
						customer.note,
						customer.active,
						customer."businessName",
						customer."referenceCode",
						customer.note,
						customer."initialDebt",
						SUM("CUSTOMER_CREDIT_ACTIVITY"."value") AS debit
				FROM
					"CUSTOMER_CREDIT_ACTIVITY"
					INNER JOIN
					customer
					ON 
						"CUSTOMER_CREDIT_ACTIVITY"."customerId" = customer."id"	
						WHERE
				customer."name"LIKE $1 and customer."active"= true
				GROUP BY
					customer."id"
				ORDER BY
					customer."id" ASC
				LIMIT $2
				OFFSET $3`,
            `%${q}%`,
            options.take,
            options.skip
          );

          let count = await prisma.customer.count({
            where: {
              active: true,
              name: {
                contains: q,
              },
            },
          });
          await prisma.$disconnect();

          return okRes(res, { debits, count });
        } catch (e) {
          return errorRes(res, e.errors);
        }
      } else {
        try {
          const debits = await prisma.$queryRaw`SELECT
					customer."id", 
					customer.phone, 
					customer."name", 
					customer."location", 
					customer.note, 
					customer.active, 
					customer."businessName", 
					customer."referenceCode", 
					customer."initialDebt",
					SUM("CUSTOMER_CREDIT_ACTIVITY"."value") AS debit
				FROM
					"CUSTOMER_CREDIT_ACTIVITY"
					INNER JOIN
					customer
					ON 
						"CUSTOMER_CREDIT_ACTIVITY"."customerId" = customer."id"	
						WHERE
						 customer."active"= true	
				GROUP BY
					customer."id"
				ORDER BY
					customer."id" ASC
				LIMIT ${options.take}
				OFFSET ${options.skip}`;

          let count = await prisma.customer.count({
            where: {
              active: true,
            },
          });
          await prisma.$disconnect();
          return okRes(res, { debits, count });
        } catch (e) {
          console.error(e);
          return errorRes(res, e.errors);
        }
      }
    }

    default: {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export default verifyAdmin(pagination(handler));
