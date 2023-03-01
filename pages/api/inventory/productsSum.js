// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";
import { verifyAdmin } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "get": {
      try {
        let queryString = `
		SELECT
		"INVENTORY_SUMS"."sum" AS quantity, 
		product."name", 
		product.shortcode, 
		product.barcode, 
		"INVENTORY_SUMS"."productId", 
		product."mUnit", 
		product.image, 
		product.active, 
		product."createdAt", 
		product."categoryId", 
		product.price, 
		product."desc"
		FROM
		"INVENTORY_SUMS"
		INNER JOIN
		product
		ON 
			"INVENTORY_SUMS"."productId" = product."id"
		WHERE
		product.active = true`;

        const count = await prisma.$queryRawUnsafe(queryString);

        await prisma.$disconnect();

        return okRes(res, count);
      } catch (e) {
        return errorRes(res, e.errors);
      }
    }

    default: {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export default verifyAdmin(handler);
