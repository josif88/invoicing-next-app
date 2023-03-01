import create from "zustand";

const useProductListStore = create((set) => ({
  products: [],
  addProduct: (p, i) =>
    set((state) => {
      return { products: [...state.products, p] };
    }),

  removeProduct: (p, i) =>
    set((state) => ({
      products: state.products.filter((e) => e.productId != p.productId),
    })),

  resetProducts: () =>
    set((state) => ({
      products: [],
    })),

  increaseQuantity: (p, i) =>
    set((state) => {
      let arr = state.products;
      ++arr[i].quantity;
      return { products: [...arr] };
    }),
  decreaseQuantity: (p, i) =>
    set((state) => {
      let arr = state.products;
      --arr[i].quantity;
      if (arr[i].quantity == 0) {
        arr[i].quantity = 1;
      }
      return { products: [...arr] };
    }),
  setProductQuantity: (p, i, q) =>
    set((state) => {
      let arr = state.products;
      arr[i].quantity = Number.parseInt(q);

      return { products: [...arr] };
    }),
}));

export default useProductListStore;
