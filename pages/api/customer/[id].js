// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { generate } from "randomstring";
import prisma from "../../../utils/db";
import { errorRes, notfoundRes, okRes } from "../../../utils/response";
import { customerSchema, validatePhone } from "../../../utils/valdations";
import { pagination, writeAuth } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "put": {
      const customerData = req.body;
      delete customerData.debit;

      try {
        if (!validatePhone(customerData.phone)) {
          return errorRes(res, "الهاتف مدخل غير صحيح");
        }
        customerData.phone = validatePhone(customerData.phone);

        const duplicatedPhoneNumber = await prisma.customer.findMany({
          where: {
            id: {
              not: customerData.id,
            },
            phone: customerData.phone,
          },
        });

        if (duplicatedPhoneNumber.length) {
          return errorRes(res, "رقم الهاتف مسجل بالفعل يرجى اختيار هاتف ثاني");
        }

        const valid = await customerSchema.validate(customerData);

        const customer = await prisma.customer.update({
          where: {
            id: valid.id,
          },
          data: {
            ...valid,
          },
        });

        return okRes(res, { date: customer });
      } catch (e) {
        return errorRes(res, e.errors);
      }
    }
    case "delete": {
      const customerData = req.body;
      try {
        const customer = await prisma.customer.update({
          where: {
            id: customerData.id,
          },
          data: {
            phone: generate(7),
            active: false,
          },
        });

        return okRes(res, { date: customer });
      } catch (e) {
        return errorRes(res, e.errors);
      }
    }

    case "get": {
      const customerId = req.query.id;
      if (!customerId) {
        return errorRes(res, "لا يوجد معرف");
      }
      const customer = await prisma.customer.findFirst({
        where: {
          id: Number.parseInt(customerId),
        },
      });

      if (!customer) {
        return notfoundRes(res);
      }

      return okRes(res, { date: customer });
    }
    default: {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export default writeAuth(pagination(handler));
