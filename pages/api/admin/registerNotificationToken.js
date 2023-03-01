// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";
import { writeAuth } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "post": {
      const data = req.body;
      data.adminId = req.admin.id;
      data.device = req.headers["user-agent"];
      try {
        const registeredToken = await prisma.notificationTokens.create({
          data: data,
        });
        return okRes(res, registeredToken);
      } catch (e) {
        console.log(e);
        return errorRes(res, e.errors);
      }
    }

    default: {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export default writeAuth(handler);
