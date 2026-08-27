export type Department = "body-care" | "perfumes" | "lenses";

export type ScentFamily =
  | "Floral Musk"
  | "Oriental Amber"
  | "Fresh Clean"
  | "Sweet Gourmand"
  | "Fruity Floral";

export type ProductCategorySlug =
  | "musk-oil"
  | "body-butter"
  | "body-scrub"
  | "hair-body-care"
  | "gift-sets";

export type Gender = "Women" | "Men" | "Unisex";

export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface ProductVariant {
  id: string;
  /** Free-form label (e.g. "Power -2.00", "90-Pack") shown instead of sizeMl
   *  when a size in millilitres doesn't describe the variant. */
  label?: string;
  sizeMl?: number;
  price: number; // cents
  compareAtPrice?: number; // cents
  stock: number;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brandLine?: string;
  department: Department;
  /** Sub-category within the department — set for body-care/perfumes,
   *  absent for lenses (which has no sub-category taxonomy of its own). */
  category?: ProductCategorySlug;
  accent: string; // hex, drives badges/overlays for this product
  shortDescription: string;
  description: string;

  // Perfumes only
  scentFamily?: ScentFamily;
  gender?: Gender;
  notes?: FragranceNotes;

  // Body Care only
  benefits?: string[];
  ingredients?: string[];
  howToUse?: string;
  skinHairType?: string;

  // Contact Lenses only
  lensType?: string;
  lensColor?: string;
  diameter?: string;
  baseCurve?: string;
  replacementDuration?: string;
  material?: string;
  waterContent?: string;
  prescriptionAvailable?: boolean;

  variants: ProductVariant[];
  images: string[]; // real product photography, first is primary
  rating: number;
  reviewCount: number;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  reviews: ProductReview[];
}

export interface Category {
  slug: ProductCategorySlug;
  name: string;
  description: string;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  rating: number;
  avatar?: string;
}
