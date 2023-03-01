import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function useAdmin(id) {
  const { data, error } = useSWR(`/api/admin/${id}`, fetcher);

  return {
    admin: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}
export function useCustomerByRef(ref) {
  const { data, error } = useSWR(`/api/customer/ref/${ref}`, fetcher);
  console.log(data);
  return {
    customer: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useCustomers() {
  const { data, error } = useSWR(`/api/customers`, fetcher);

  return {
    customers: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}
export function useCustomersToListView() {
  const { data, error } = useSWR(`/api/customersToListView`, fetcher);

  return {
    customers: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useDebits(options) {
  const { data, error } = useSWR(
    options.query
      ? `/api/customer/debits?p=${options.current}&s=${options.pageSize}&q=${options.query}`
      : `/api/customer/debits?p=${options.current}&s=${options.pageSize}`,
    fetcher
  );

  return {
    customers: data && data.data.debits,
    count: data && data.data.count,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useProductInventory(id) {
  const { data, error } = useSWR(`/api/inventory?productId=${id}`, fetcher);
  return {
    inventoryRecords: data && data.data.inventoryRecords,
    count: data && data.data.count,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useProductSum(id) {
  const { data, error } = useSWR(`/api/inventory/sum?p=${id}`, fetcher);
  return {
    sum: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useProductsByCategory(id) {
  const { data, error } = useSWR(
    `/api/inventory/productsByCategory?id=${id}`,
    fetcher
  );
  return {
    sum: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function usePayments(options) {
  const { data, error } = useSWR(
    options.query
      ? `/api/payments?p=${options.current}&s=${options.pageSize}&q=${options.query}`
      : `/api/payments?p=${options.current}&s=${options.pageSize}`,
    fetcher
  );

  return {
    payments: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useInvoices(options) {
  const { data, error } = useSWR(
    options.query
      ? `/api/invoices?p=${options.current}&s=${options.pageSize}&q=${options.query}`
      : `/api/invoices?p=${options.current}&s=${options.pageSize}`,
    fetcher
  );

  return {
    invoices: data && data.data.invoices,
    count: data && data.data.count,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useExpenses(options) {
  const { data, error } = useSWR(
    options.query
      ? `/api/expenses?p=${options.current}&s=${options.pageSize}&q=${options.query}`
      : `/api/expenses?p=${options.current}&s=${options.pageSize}`,
    fetcher
  );

  return {
    expenses: data && data.data.expenses,
    count: data && data.data.count,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useOrders(options) {
  const { data, error } = useSWR(
    options.query
      ? `/api/orders?p=${options.current}&s=${options.pageSize}&q=${options.query}`
      : `/api/orders?p=${options.current}&s=${options.pageSize}`,
    fetcher
  );

  return {
    data: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useOrdersByUserRef(options, ref) {
  const { data, error } = useSWR(
    `/api/ordersByCustomer?p=${options.current}&s=${options.pageSize}&ref=${ref}`,
    fetcher
  );

  return {
    data: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useProductsSum() {
  const { data, error } = useSWR(`/api/inventory/productsSum`, fetcher);
  return {
    sum: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useProduct(id) {
  const { data, error } = useSWR(`/api/product/${id}`, fetcher);
  return {
    product: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useCategories() {
  const { data, error } = useSWR(`/api/categories`, fetcher);
  return {
    categories: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useProducts(options) {
  const { data, error } = useSWR(
    options.query
      ? `/api/products?p=${options.current}&s=${options.pageSize}&q=${options.query}`
      : `/api/products?p=${options.current}&s=${options.pageSize}`,
    fetcher
  );
  return {
    products: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useCustomerActivity(options) {
  let url = `/api/reports/customerActivity?customer=${options.id}`;

  let { start, end, order } = options;

  if (start) {
    url = url + `&start=${start}`;
  }

  if (end) {
    url = url + `&end=${end}`;
  }
  if (order) {
    url = url + `&order=${order}`;
  }

  const { data, error } = useSWR(url, fetcher);

  return {
    customerActivity: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useFundActivity(options) {
  let url = `/api/reports/fundActivity?`;

  let { start, end, order } = options;

  if (start) {
    url = url + `&start=${start}`;
  }

  if (end) {
    url = url + `&end=${end}`;
  }
  if (order) {
    url = url + `&order=${order}`;
  }

  const { data, error } = useSWR(url, fetcher);

  return {
    fundActivity: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useProductActivity(options) {
  let url = `/api/reports/productActivity?product=${options.id}`;

  let { start, end, order } = options;

  if (start) {
    url = url + `&start=${start}`;
  }

  if (end) {
    url = url + `&end=${end}`;
  }
  if (order) {
    url = url + `&order=${order}`;
  }

  const { data, error } = useSWR(url, fetcher);

  return {
    productActivity: data && data.data,
    isLoading: !error && !data,
    isError: error,
  };
}
