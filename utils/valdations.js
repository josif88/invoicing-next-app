import * as PhoneFormat from "@solocreativestudio/phoneformatter";
import * as jwt from "jsonwebtoken";
import * as yup from "yup";

export const validatePhone = (phoneNumber) => {
  const isValid = PhoneFormat.getAllFormats(phoneNumber, "iq").isNumber;
  if (isValid) return PhoneFormat.getAllFormats(phoneNumber, "iq").globalP;
  else return false;
};

export const verifyAuth = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return false;
  }
};

export const customerSchema = yup.object({
  name: yup.string().required("اسم الوكيل مطلوب"),
  phone: yup.string().required("رقم الهاتف العراقي مطلوب"),
  businessName: yup.string(),
  referenceCode: yup.string(),
  initialDebt: yup.number("ارقام فقط"),
  location: yup.string(),
  note: yup.string(),
  adminId: yup.number(),
  active: yup.boolean(),
});

export const productSchema = yup.object({
  categoryId: yup.number("يجب ان يكون معرف التصنيف رقم").nullable(),
  name: yup.string().required("اسم المنتج مطلوب"),
  price: yup.number().required("يرجى ادخال السعر"),
  shortcode: yup.number().nullable(),
  barcode: yup.string().nullable(),
  mUnit: yup.string("يرجى ادخال وحدة القياس"),
  desc: yup.string().nullable(),
  image: yup.string().url().nullable(),
  active: yup.boolean(),
});

export const categorySchema = yup.object({
  name: yup.string().required("اسم الصنف مطلوب"),
});

export const inventorySchema = yup.object({
  productId: yup.number().required("المنتج مطلوب"),
  price: yup.number().nullable(),
  note: yup.string().nullable(),
  quantity: yup.number().required("يرجى ادخال الكمية"),
});

export const invoiceSchema = yup.object({
  adminId: yup.number().required(),
  note: yup.string().nullable(),
  customerId: yup.number().nullable(),
  onCredit: yup.boolean().required(),
  total: yup.number(),
});

export const invoiceItemSchema = yup.object().shape({
  productId: yup
    .number("خطأ في اختيار المادة")
    .required("يرجى اختيار المادة")
    .typeError("يرجى اختيار المادة"),
  price: yup.number("السعر خاطيء").required("السعر مطلوب"),
  quantity: yup.number("يوجد خطأ في الكمية").required("الكمية مطلوبة"),
});

export const orderSchema = yup.object({
  customerId: yup.number().nullable().typeError("يرجى تحديد الزبون"),
});

export const orderItemSchema = yup.object().shape({
  productId: yup
    .number("خطأ في اختيار المادة")
    .required("يرجى اختيار المادة")
    .typeError("خطأ في اختيار المادة"),
  quantity: yup
    .number("يوجد خطأ في الكمية")
    .required("الكمية مطلوبة")
    .typeError("خطأ في الكمية"),
});

export const paymentSchema = yup.object({
  adminId: yup.number().required(),
  customerId: yup.number().typeError("يرجى اختيار الوكيل"),
  date: yup.date(),
  invoiceId: yup.number().nullable(),
  value: yup
    .number()
    .min(1, "يرجى ادخال القيمة")
    .required("يرجى ادخال القيمة")
    .typeError("يرجى ادخال القيمة"),
  note: yup.string().nullable(),
});

export const expenseSchema = yup.object({
  adminId: yup.number().required(),
  issuedTo: yup
    .string()
    .required("اسم المستلم مطلوب")
    .typeError("خطاً في الادخال"),
  category: yup.string().nullable(),
  createdAt: yup.date(),
  value: yup
    .number()
    .min(1, "يرجى ادخال القيمة")
    .required("يرجى ادخال القيمة")
    .typeError("يرجى ادخال القيمة"),
  note: yup.string().nullable(),
});
