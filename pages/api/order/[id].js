// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, notfoundRes, okRes } from "../../../utils/response";
import { pagination, writeAuth } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "put": {
      const orderData = req.body;
      const orderId = Number.parseInt(req.query.id);
      try {
        // find the invoice
        const order = await prisma.order.findFirst({
          where: {
            id: orderId,
          },
        });

        // if you find it then delete all related invoice items
        if (order) {
          await prisma.orderItem.deleteMany({
            where: {
              orderId,
            },
          });
        }

        const newOrder = await prisma.order.update({
          where: {
            id: orderId,
          },
          data: {
            ...orderData,
          },
        });

        return okRes(res, newOrder);
      } catch (e) {
        console.log(e);
        return errorRes(res, e);
      }
    }
    case "delete": {
      const orderId = Number.parseInt(req.query.id);

      try {
        const deleteItems = prisma.orderItem.deleteMany({
          where: {
            orderId,
          },
        });

        const deleteOrder = prisma.order.delete({
          where: {
            id: orderId,
          },
        });

        const transaction = await prisma.$transaction([
          deleteItems,
          deleteOrder,
        ]);

        return okRes(res, { date: transaction });
      } catch (e) {
        return errorRes(res, e.errors);
      }
    }

    case "get": {
      const orderId = req.query.id;
      if (!orderId) {
        return errorRes(res, "لا يوجد معرف");
      }
      const order = await prisma.order.findFirst({
        where: {
          id: Number.parseInt(orderId),
        },
        include: {
          orderItem: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      });

      if (!order) {
        return notfoundRes(res);
      }

      return okRes(res, order);
    }

    case "patch": {
      const orderData = req.body;
      const orderId = Number.parseInt(req.query.id);
      try {
        // find the invoice
        const order = await prisma.order.findFirst({
          where: {
            id: orderId,
          },
        });

        if (!order) {
          return notfoundRes(res);
        }

        const newOrder = await prisma.order.update({
          where: {
            id: orderId,
          },
          data: {
            ...orderData,
          },
        });
        return okRes(res, newOrder);
      } catch (e) {
        console.log(e);
        return errorRes(res, e);
      }
    }
    default: {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export default writeAuth(pagination(handler));
