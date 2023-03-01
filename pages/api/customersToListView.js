import prisma from "../../utils/db";
import { notfoundRes, okRes } from "../../utils/response";
import { pagination, verifyAdmin } from "./middleware";

const handler = async (req, res) => {
  if (req.method.toLowerCase() === "get") {
    const customers = await prisma.customer.findMany({
      where: {
        active: true,
      },
    });
    return okRes(res, customers);
  } else {
    return notfoundRes(res);
  }
};

export default verifyAdmin(handler);
