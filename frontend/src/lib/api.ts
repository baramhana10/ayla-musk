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
    const details = Array.isArray(data.details)
      ? data.details
          .filter((detail: unknown): detail is { path?: string; message: string } =>
            typeof detail === "object" && detail !== null &&
            "message" in detail && typeof detail.message === "string")
          .map((detail: { path?: string; message: string }) =>
            detail.path ? `${detail.path}: ${detail.message}` : detail.message)
          .join("; ")
      : "";
    const message = typeof data.error === "string" ? data.error : "Something went wrong. Please try again.";
    throw new ApiClientError(res.status, details ? `${message}: ${details}` : message);
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
  validate: (code: string) => request<{ valid: boolean; coupon?: CouponDto }>(`/api/coupons/validate/${encodeURIComponent(code)}`),
  upsert: (payload: CouponDto) => request<{ coupon: CouponDto }>("/api/coupons", { method: "POST", body: JSON.stringify(payload) }),
  remove: (code: string) => request<void>(`/api/coupons/${code}`, { method: "DELETE" }),
};

// ---------- Admin ----------
export interface AdminStatsDto { revenue: number; orderCount: number; avgOrderValue: number; lowStockCount: number; visitorCount: number; visitors24Hours: number; visitors7Days: number }

export const analyticsApi = {
  visit: (visitorId: string) => request<void>("/api/analytics/visit", {
    method: "POST", body: JSON.stringify({ visitorId }),
  }),
};

export const adminApi = {
  stats: () => request<AdminStatsDto>("/api/admin/stats"),
};

export interface ContactMessageDto {
  id: string; name: string; email: string; subject: string; message: string; read: boolean; createdAt: string;
}
export interface NewsletterSubscriberDto { email: string; active: boolean; createdAt: string }
export const communicationsApi = {
  contact: (payload: { name: string; email: string; subject: string; message: string }) =>
    request<{ received: boolean }>("/api/contact", { method: "POST", body: JSON.stringify(payload) }),
  messages: () => request<{ messages: ContactMessageDto[] }>("/api/contact"),
  markRead: (id: string, read: boolean) => request<{ message: ContactMessageDto }>(`/api/contact/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ read }) }),
  subscribe: (email: string) => request<{ received: boolean; unsubscribeToken?: string }>("/api/newsletter", { method: "POST", body: JSON.stringify({ email, consent: true }) }),
  unsubscribe: (token: string) => request<{ unsubscribed: boolean }>("/api/newsletter/unsubscribe", { method: "POST", body: JSON.stringify({ token }) }),
  subscribers: () => request<{ subscribers: NewsletterSubscriberDto[] }>("/api/newsletter"),
  setSubscriberActive: (email: string, active: boolean) => request<{ subscriber: NewsletterSubscriberDto }>(`/api/newsletter/${encodeURIComponent(email)}`, { method: "PATCH", body: JSON.stringify({ active }) }),
};

/** Upload directly to Cloudinary with a short-lived, admin-only signature. */
export async function uploadImage(file: File): Promise<string> {
  const signed = await request<{ uploadUrl: string; apiKey: string; params: Record<string, string>; signature: string }>("/api/uploads/signature", { method: "POST" });
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signed.apiKey);
  form.append("signature", signed.signature);
  for (const [key, value] of Object.entries(signed.params)) form.append(key, value);
  const res = await fetch(signed.uploadUrl, { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || typeof data.secure_url !== "string" || !data.secure_url.startsWith("https://res.cloudinary.com/")) {
    throw new ApiClientError(res.status || 500, typeof data.error === "string" ? data.error : "Image upload failed.");
  }
  return data.secure_url;
}
