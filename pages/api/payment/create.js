// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";
import { paymentSchema } from "../../../utils/valdations";
import { verifyAdmin } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "post": {
      const paymentData = req.body;

      try {
        //validation
        const valid = await paymentSchema.validate(paymentData);
        const payment = await prisma.payment.create({ data: paymentData });
        return okRes(res, payment);
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
