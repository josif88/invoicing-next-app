// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";


import { verifyAdmin } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "delete": {
      const recordId = req.query.id;
      try {
        await prisma.inventory.delete({
          where: {
            id: Number.parseInt(recordId),
          },
        });
        return okRes(res, { recordId: "تم حذف الصف" });
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
