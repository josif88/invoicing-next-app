import moment from "moment";
import create from "zustand";

const useInvoiceStore = create((set, get) => ({
  invoice: {
    customerId: null,
    adminId: null,
    active: true,
    onCredit: false,
    createdAt: moment(),
    isReturn: false,
    note: null,
    invoiceItem: [],
  },

  set: (invoice) =>
    set((state) => {
      return {
        invoice,
      };
    }),

  setAdminId: (id) =>
    set((state) => {
      return {
        invoice: {
          ...state.invoice,
          adminId: id,
        },
      };
    }),

  setCustomerId: (id) =>
    set((state) => {
      return {
        invoice: {
          ...state.invoice,
          customerId: id,
        },
      };
    }),

  setIsReturn: (toggle) =>
    set((state) => {
      return {
        invoice: {
          ...state.invoice,
          isReturn: toggle,
        },
      };
    }),

  setOnCredit: (toggle) =>
    set((state) => {
      return {
        invoice: {
          ...state.invoice,
          onCredit: toggle,
        },
      };
    }),

  setCreatedAt: (date) =>
    set((state) => {
      return {
        invoice: {
          ...state.invoice,
          createdAt: date,
        },
      };
    }),

  setProductPrice: (index, price) =>
    set((state) => {
      state.invoice.invoiceItem[index].price = price;
      return {
        invoice: {
          ...state.invoice,
        },
      };
    }),

  setProductQuantity: (index, quantity) =>
    set((state) => {
      state.invoice.invoiceItem[index].quantity = quantity;
      return {
        invoice: {
          ...state.invoice,
        },
      };
    }),

  setNote: (str) =>
    set((state) => {
      return {
        invoice: {
          ...state.invoice,
          note: str,
        },
      };
    }),

  addInvoiceItem: (item) =>
    set((state) => {
      return {
        invoice: {
          ...state.invoice,
          invoiceItem: [...state.invoice.invoiceItem, item],
        },
      };
    }),

  removeInvoiceItem: (item) =>
    set((state) => {
      return {
        invoice: {
          ...state.invoice,
          invoiceItem: state.invoice.invoiceItem.filter(
            (i) => i.productId != item.productId
          ),
        },
      };
    }),

  getInvoiceItem: () => get().invoice.invoiceItem,

  resetInvoice: () =>
    set((state) => ({
      invoice: {
        customerId: null,
        adminId: null,
        active: true,
        onCredit: false,
        createdAt: moment(),
        note: "",
        invoiceItem: [],
      },
    })),
}));

export default useInvoiceStore;
