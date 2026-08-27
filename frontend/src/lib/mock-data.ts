import type { Product, Testimonial } from "./types";

export const testimonials: Testimonial[] = [
  { id: "t1", name: "Amélie R.", quote: "The Musk Oil Discovery Set is the first fragrance that's ever felt like *me*. I get stopped constantly.", rating: 5 },
  { id: "t2", name: "Sofia K.", quote: "The packaging alone feels like a gift. The strawberry body butter lasts from my 6am gym class to dinner.", rating: 5 },
  { id: "t3", name: "Layla H.", quote: "The hair serum is unreal. My hair has never felt softer, and it smells incredible.", rating: 5 },
  { id: "t4", name: "Grace T.", quote: "I've bought three gift sets this year alone — every single friend has asked where it's from.", rating: 5 },
];

export function minPrice(product: Product) {
  return Math.min(...product.variants.map((v) => v.price));
}

export function maxCompareAt(product: Product) {
  const compares = product.variants.map((v) => v.compareAtPrice).filter(Boolean) as number[];
  return compares.length ? Math.max(...compares) : undefined;
}
