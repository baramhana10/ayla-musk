import type { Product } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getProductBySlugServer(slug: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/api/products/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.product;
}

export async function getAllProductsServer(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/api/products`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.products;
}

export function getRelatedProductsServer(product: Product, all: Product[], count = 4): Product[] {
  const sameDepartment = all.filter((p) => p.id !== product.id && p.department === product.department);
  return sameDepartment
    .filter((p) => product.scentFamily && p.scentFamily === product.scentFamily)
    .concat(sameDepartment.filter((p) => product.category && p.category === product.category))
    .concat(sameDepartment)
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .slice(0, count);
}
