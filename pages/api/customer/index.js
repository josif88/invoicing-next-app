// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { generate } from "randomstring";
import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";
import { customerSchema, validatePhone } from "../../../utils/valdations";
import { writeAuth } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "post": {
      const customerData = req.body;
      customerData.password = generate(6);
      customerData.referenceCode = generate(6);
      try {
        const valid = await customerSchema.validate(customerData);

        if (!validatePhone(valid.phone)) {
          return errorRes(res, "الهاتف مدخل غير صحيح");
        }
        valid.phone = validatePhone(valid.phone);

        const duplicatedPhoneNumber = await prisma.customer.findMany({
          where: {
            phone: valid.phone,
          },
        });

        if (duplicatedPhoneNumber.length) {
          return errorRes(res, "رقم الهاتف مسجل بالفعل يرجى اختيار هاتف ثاني");
        }

        const customer = await prisma.customer.create({ data: valid });

        return okRes(res, customer);
      } catch (e) {
        return errorRes(res, e.errors);
      }
    }
    default: {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export default writeAuth(handler);
