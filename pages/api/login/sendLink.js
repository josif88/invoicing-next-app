import prisma from "../../../utils/db";
import { errorRes, notfoundRes, okRes } from "../../../utils/response";
import { sendLink } from "../../../utils/tools";

export default async function handler(req, res) {
  switch (req.method.toLowerCase()) {
    case "post": {
      const phone = req.body.phone;

      if (!phone) {
        return errorRes(res, "يرجى ادخال رقم الهاتف");
      }

      const customer = await prisma.customer.findFirst({
        where: {
          phone,
        },
      });
      if (!customer) {
        return errorRes(res, "رقم الهاتف غير مسجل");
      }
      try {
        await sendLink(
          phone,
          `${req.headers.host}/u/${customer.referenceCode}`
        );
        return okRes(res, {
          message: " تم ارسال الرسالة الى الرقم" + customer.name,
        });
      } catch (e) {
        return errorRes(res, e);
      }
    }

    default: {
      return notfoundRes(res);
    }
  }
}
