// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, notfoundRes, okRes } from "../../../utils/response";
import { invoiceSchema, paymentSchema } from "../../../utils/valdations";
import { writeAuth } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "put": {
      const paymentData = req.body;
      const { customer, invoice, createdBy, ...restBody } = paymentData;
      const paymentId = Number.parseInt(req.query.id);

      try {
        //make sure of entries
        const valid = await paymentSchema.validate(restBody);

        // find the invoice
        const payment = await prisma.payment.findFirst({
          where: {
            id: paymentId,
          },
        });

        if (!payment) return errorRes(res, "لم يتم العثور على الفاتورة");

        const updatedPayment = await prisma.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            ...valid,
          },
        });

        return okRes(res, updatedPayment);
      } catch (e) {
        console.log(e);
        return errorRes(res, e);
      }
    }
    case "delete": {
      const paymentId = Number.parseInt(req.query.id);

      try {
        const deletePayment = prisma.payment.delete({
          where: {
            id: paymentId,
          },
        });

        const transaction = await prisma.$transaction([deletePayment]);
        return okRes(res, { date: transaction });
      } catch (e) {
        return errorRes(res, e.errors);
      }
    }

    case "get": {
      const paymentId = req.query.id;
      if (!paymentId) {
        return errorRes(res, "لا يوجد معرف");
      }
      const payment = await prisma.payment.findFirst({
        where: {
          id: Number.parseInt(paymentId),
        },
        include: {
          customer: true,
          createdBy: true,
          invoice: true,
        },
      });

      if (!payment) {
        return notfoundRes(res);
      }
      return okRes(res, payment);
    }
    default: {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export default writeAuth(handler);
