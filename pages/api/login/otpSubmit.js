import prisma from "../../../utils/db";
import { errorRes, notfoundRes, okRes } from "../../../utils/response";
import * as jwt from "jsonwebtoken";

export default async function handler(req, res) {
  switch (req.method.toLowerCase()) {
    case "post": {
      const submittedOtp = req.body.otp;
      const storedReference = req.body.reference;

      if (!submittedOtp) {
        return errorRes(res, "يرجى التأكد من ادخال كلمة السر");
      } else if (!storedReference) {
        return errorRes(res, "الرقم المرجعي مفقود");
      }

      const otp = await prisma.otp.findFirst({
        where: { reference: storedReference },
      });

      //if no admin were found response with not found error
      if (!otp) {
        return errorRes(res, "الرقم المرجعي غير معرف يرجى اعادة ارسال الرمز");
      } else if (otp.tries > 2) {
        return errorRes(res, "تم تجاوز المحاولات المسموح بها", "/");
      }

      if (otp.password === submittedOtp) {
        const token = jwt.sign(
          { id: otp.adminId, role: "admin" },
          process.env.JWT_SECRET,
          {
            expiresIn: "30d",
          }
        );

        return okRes(res, { token });
      } else {
        otp.tries = otp.tries + 1;
        await prisma.otp.update({
          where: {
            id: otp.id,
          },
          data: {
            ...otp,
          },
        });

        console.log(otp);

        return errorRes(res, "كلمة السر المدخلة غير صحيحة");
      }
    }

    default: {
      return notfoundRes(res);
    }
  }
}
