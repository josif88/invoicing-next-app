// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";

import { notfoundRes, okRes } from "../../../utils/response";
import { verifyAdmin } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "get": {
      let adminId = req.query.id;
      adminId = Number.parseInt(adminId);

      if (!adminId) {
        return notfoundRes(res);
      } else {
        const admin = await prisma.admin.findFirst({ where: { id: adminId } });
        if (!admin) {
          return notfoundRes(res);
        }
        return okRes(res, { ...admin });
      }
    }

    default: {
      return res.status(500).json({ message: "Get method only" });
    }
  }
};

export default verifyAdmin(handler);
