import prisma from "../../../utils/db";
import { errorRes, notfoundRes, okRes } from "../../../utils/response";
import { invoiceSchema } from "../../../utils/valdations";
import { pagination, writeAuth } from "../middleware";

const handler = async (req, res) => {
  switch (req.method.toLowerCase()) {
    case "put": {
      //calculate subtotals and total
      const invoiceData = req.body;
      let { invoiceItem } = invoiceData;

      invoiceItem = invoiceItem.map((i) => {
        delete i.product;
        return i;
      });

      if (!invoiceItem.length) {
        return errorRes(res, "لم يتم الحفظ يرجى اختيار مادة واحدة على الاقل");
      }

      invoiceData.invoiceItem = { create: invoiceItem };

      let total = 0;

      //Handle returning products
      if (req.body.isReturn) {
        for (let i = 0; i < invoiceData.invoiceItem.create.length; i++) {
          if (invoiceData.invoiceItem.create[i].quantity > 0) {
            invoiceData.invoiceItem.create[i].quantity =
              invoiceData.invoiceItem.create[i].quantity * -1;
          }
        }
      } else {
        for (let i = 0; i < invoiceData.invoiceItem.create.length; i++) {
          if (invoiceData.invoiceItem.create[i].quantity < 0) {
            invoiceData.invoiceItem.create[i].quantity =
              invoiceData.invoiceItem.create[i].quantity * -1;
          }
        }
      }

      for (let i = 0; i < invoiceData.invoiceItem.create.length; i++) {
        invoiceData.invoiceItem.create[i].subTotal =
          invoiceData.invoiceItem.create[i].price *
          invoiceData.invoiceItem.create[i].quantity;

        total = total + invoiceData.invoiceItem.create[i].subTotal;
      }

      invoiceData.total = total;

      const invoiceId = Number.parseInt(req.query.id);

      try {
        //make sure of entries
        const valid = await invoiceSchema.validate(invoiceData);

        // find the invoice
        const invoice = await prisma.invoice.findFirst({
          where: {
            id: invoiceId,
          },
        });

        // if you find it then delete all related invoice items
        if (invoice) {
          await prisma.invoiceItem.deleteMany({
            where: {
              invoiceId,
            },
          });
        }

        const newInvoice = await prisma.invoice.update({
          where: {
            id: invoiceId,
          },
          data: {
            ...valid,
          },
        });

        return okRes(res, newInvoice);
      } catch (e) {
        console.log(e);
        return errorRes(res, e);
      }
    }
    case "delete": {
      const invoiceId = Number.parseInt(req.query.id);

      try {
        const deleteItems = prisma.invoiceItem.deleteMany({
          where: {
            invoiceId: invoiceId,
          },
        });

        const deleteInvoice = prisma.invoice.delete({
          where: {
            id: invoiceId,
          },
        });

        const transaction = await prisma.$transaction([
          deleteItems,
          deleteInvoice,
        ]);

        return okRes(res, { date: transaction });
      } catch (e) {
        console.log(e);
        return errorRes(res, e.errors);
      }
    }

    case "get": {
      const invoiceId = req.query.id;
      if (!invoiceId) {
        return errorRes(res, "لا يوجد معرف");
      }
      const invoice = await prisma.invoice.findFirst({
        where: {
          id: Number.parseInt(invoiceId),
        },
        include: {
          invoiceItem: {
            include: {
              product: true,
            },
          },
          customer: true,
          createdBy: true,
        },
      });

      if (!invoice) {
        return notfoundRes(res);
      }

      return okRes(res, { ...invoice });
    }
    default: {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export default writeAuth(pagination(handler));
