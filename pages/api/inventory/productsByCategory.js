// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "get": {
      let count = null;
      try {
        const categoryId = Number.parseInt(req.query.id);
        if (isNaN(categoryId)) {
          count = await prisma.$queryRaw`Select
		  "INVENTORY_SUMS".sum As quantity,
		  product.name,
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
	  From
		  "INVENTORY_SUMS" Inner Join
		  product On "INVENTORY_SUMS"."productId" = product.id
	  Where
		  product.active 
		  
			`;
        } else {
          count = await prisma.$queryRaw`Select
		  "INVENTORY_SUMS".sum As quantity,
		  product.name,
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
	  From
		  "INVENTORY_SUMS" Inner Join
		  product On "INVENTORY_SUMS"."productId" = product.id
	  Where
		  product.active And
		  product."categoryId" = ${categoryId}
		  
			`;
        }
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

export default handler;
