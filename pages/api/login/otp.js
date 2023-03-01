import prisma from "../../../utils/db";
import { errorRes, notfoundRes, okRes } from "../../../utils/response";
import { sendOtp } from "../../../utils/tools";
import { validatePhone } from "../../../utils/valdations";

export default async function handler(req, res) {
  switch (req.method.toLowerCase()) {
    case "post": {
      const phoneNumber = req.body.phoneNumber;

      if (!phoneNumber) {
        return errorRes(res, "يرجى ادخال رقم الهاتف");
      }
      const isValid = validatePhone(phoneNumber);

      if (isValid) {
        const admin = await prisma.admin.findFirst({
          where: { phone: isValid },
        });

        //if no admin were found response with not found error
        if (!admin) {
          return errorRes(res, "هذا الرقم غير مسجل");
        }
        let randomstring = require("randomstring");
        const otp = await prisma.otp.create({
          data: {
            adminId: admin.id,
            password: null,
            tries: 0,
            reference: randomstring.generate(),
          },
        });

        sendOtp(isValid, otp.password).then(console.log).catch(console.log);

        return okRes(res, {
          reference: otp.reference,
          createdAt: otp.createdAt,
        });
      } else {
        return errorRes(res, "رقم الهاتف غير صحيح");
      }
    }

    default: {
      return notfoundRes(res);
    }
  }
}
