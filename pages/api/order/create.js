// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { notifyAdmin } from "../../../utils/pushNotification";
import { errorRes, okRes } from "../../../utils/response";
import { orderSchema } from "../../../utils/valdations";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "post": {
      const orderData = req.body;

      try {
        const valid = await orderSchema.validate(orderData);
        let orderItems = valid.orderItem;
        valid.orderItem = { create: orderItems };
        const order = await prisma.order.create({ data: valid });

        notifyAdmin(order);
        return okRes(res, order);
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

export default handler;
