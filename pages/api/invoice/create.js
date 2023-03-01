// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from "../../../utils/db";
import { errorRes, okRes } from "../../../utils/response";
import { invoiceSchema } from "../../../utils/valdations";

import { verifyAdmin } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "post": {
      const invoiceData = req.body;
      let { invoiceItem } = invoiceData;

      if (!invoiceItem.length) {
        return errorRes(res, "يرجى ادخال مادة واحدة على الاقل");
      }

      invoiceItem = invoiceItem.map((i) => {
        delete i.product;
        return i;
      });

      invoiceData.invoiceItem = { create: invoiceItem };

      try {
        //calculate subtotals and total
        let total = 0;
        if (req.body.isReturn) {
          for (let i = 0; i < invoiceData.invoiceItem.create.length; i++) {
            invoiceData.invoiceItem.create[i].quantity =
              invoiceData.invoiceItem.create[i].quantity * -1;
          }
        }
        for (let i = 0; i < invoiceData.invoiceItem.create.length; i++) {
          invoiceData.invoiceItem.create[i].subTotal =
            invoiceData.invoiceItem.create[i].price *
            invoiceData.invoiceItem.create[i].quantity;
          total = total + invoiceData.invoiceItem.create[i].subTotal;
        }

        invoiceData.total = total;

        const valid = await invoiceSchema.validate(invoiceData);
        const invoice = await prisma.invoice.create({ data: invoiceData });

        return okRes(res, invoice);
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

export default verifyAdmin(handler);
