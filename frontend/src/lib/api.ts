import type { Product, Category, ProductReview } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiClientError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiClientError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiClientError(res.status, data.error || "Something went wrong. Please try again.");
  }
  return data as T;
}

// ---------- Auth ----------
export interface AuthUserDto {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: AuthUserDto }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  me: () => request<{ user: AuthUserDto }>("/api/auth/me"),
};

// ---------- Products ----------
export interface ProductListParams {
  department?: string;
  category?: string;
  scentFamily?: string;
  search?: string;
  maxPrice?: number;
  sort?: string;
  limit?: number;
}

export const productsApi = {
  list: (params: ProductListParams = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    });
    const query = qs.toString();
    return request<{ products: Product[] }>(`/api/products${query ? `?${query}` : ""}`);
  },
  get: (slug: string) => request<{ product: Product }>(`/api/products/${slug}`),
  create: (payload: unknown) => request<{ product: Product }>("/api/products", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: unknown) => request<{ product: Product }>(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  duplicate: (id: string) => request<{ product: Product }>(`/api/products/${id}/duplicate`, { method: "POST" }),
  remove: (id: string) => request<void>(`/api/products/${id}`, { method: "DELETE" }),
};

// ---------- Categories ----------
export const categoriesApi = {
  list: () => request<{ categories: Category[] }>("/api/categories"),
  create: (payload: unknown) => request<{ category: Category }>("/api/categories", { method: "POST", body: JSON.stringify(payload) }),
  update: (slug: string, payload: unknown) => request<{ category: Category }>(`/api/categories/${slug}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (slug: string) => request<void>(`/api/categories/${slug}`, { method: "DELETE" }),
};

// ---------- Reviews ----------
export interface AdminReviewDto extends ProductReview {
  productId: string;
  productName: string;
}

export const reviewsApi = {
  listForProduct: (productId: string) => request<{ reviews: ProductReview[] }>(`/api/reviews/product/${productId}`),
  listAll: () => request<{ reviews: AdminReviewDto[] }>("/api/reviews"),
  create: (productId: string, payload: { rating: number; title: string; body: string }) =>
    request<{ review: ProductReview }>(`/api/reviews/product/${productId}`, { method: "POST", body: JSON.stringify(payload) }),
  remove: (id: string) => request<void>(`/api/reviews/${id}`, { method: "DELETE" }),
};

// ---------- Orders ----------
export interface OrderDto {
  id: string;
  createdAt: string;
  status: "processing" | "shipped" | "delivered";
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string | null;
  shippingAddress: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
  };
  items: { productSlug: string; productName: string; accent: string; image?: string; label?: string; sizeMl?: number; quantity: number; price: number }[];
}

export const ordersApi = {
  create: (payload: {
    items: { variantId: string; quantity: number }[];
    couponCode?: string;
    shippingAddress: OrderDto["shippingAddress"];
  }) => request<{ order: OrderDto }>("/api/orders", { method: "POST", body: JSON.stringify(payload) }),
  list: () => request<{ orders: OrderDto[] }>("/api/orders"),
  get: (id: string) => request<{ order: OrderDto }>(`/api/orders/${id}`),
  updateStatus: (id: string, status: OrderDto["status"]) =>
    request<{ order: OrderDto }>(`/api/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

// ---------- Coupons ----------
export interface CouponDto { code: string; label: string; percentOff: number; active: boolean }

export const couponsApi = {
  list: () => request<{ coupons: CouponDto[] }>("/api/coupons"),
  validate: (code: string) => request<{ valid: boolean; coupon?: CouponDto }>(`/api/coupons/validate/${code}`),
  upsert: (payload: CouponDto) => request<{ coupon: CouponDto }>("/api/coupons", { method: "POST", body: JSON.stringify(payload) }),
  remove: (code: string) => request<void>(`/api/coupons/${code}`, { method: "DELETE" }),
};

// ---------- Admin ----------
export interface AdminStatsDto { revenue: number; orderCount: number; avgOrderValue: number; lowStockCount: number }

export const adminApi = {
  stats: () => request<AdminStatsDto>("/api/admin/stats"),
};
