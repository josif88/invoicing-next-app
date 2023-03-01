// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { generate } from "randomstring";
import prisma from "../../../../utils/db";
import { errorRes, notfoundRes, okRes } from "../../../../utils/response";
import { customerSchema } from "../../../../utils/valdations";
import { pagination, writeAuth } from "../../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "get": {
      const customerRef = req.query.ref;
      if (!customerRef) {
        return errorRes(res, "لا يوجد معرف");
      }
      const customer = await prisma.customer.findFirst({
        where: {
          referenceCode: customerRef,
        },
      });

      if (!customer) {
        return notfoundRes(res);
      }

      return okRes(res, customer);
    }
    default: {
      return res.status(500).json({ message: "get method only" });
    }
  }
};

export default handler;
