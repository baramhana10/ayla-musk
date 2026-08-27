import type { Product, ProductVariant, Review, Category } from "@prisma/client";

type ProductWithRelations = Product & { variants: ProductVariant[]; reviews?: Review[] };

function safeParseArray(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeProduct(product: ProductWithRelations) {
  const hasNotes = Boolean(product.notesTop || product.notesHeart || product.notesBase) && product.department === "perfumes";
  const benefits = safeParseArray(product.benefits);
  const ingredients = safeParseArray(product.ingredients);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brandLine: product.brandLine ?? undefined,
    department: product.department,
    category: product.categorySlug ?? undefined,
    accent: product.accent,
    shortDescription: product.shortDescription,
    description: product.description,

    scentFamily: product.scentFamily ?? undefined,
    gender: product.gender ?? undefined,
    notes: hasNotes
      ? {
          top: safeParseArray(product.notesTop),
          heart: safeParseArray(product.notesHeart),
          base: safeParseArray(product.notesBase),
        }
      : undefined,

    benefits: benefits.length ? benefits : undefined,
    ingredients: ingredients.length ? ingredients : undefined,
    howToUse: product.howToUse ?? undefined,
    skinHairType: product.skinHairType ?? undefined,

    lensType: product.lensType ?? undefined,
    lensColor: product.lensColor ?? undefined,
    diameter: product.diameter ?? undefined,
    baseCurve: product.baseCurve ?? undefined,
    replacementDuration: product.replacementDuration ?? undefined,
    material: product.material ?? undefined,
    waterContent: product.waterContent ?? undefined,
    prescriptionAvailable: product.prescriptionAvailable,

    images: safeParseArray(product.imagesJson),
    variants: product.variants.map((v) => ({
      id: v.id,
      label: v.label ?? undefined,
      sizeMl: v.sizeMl ?? undefined,
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? undefined,
      stock: v.stock,
    })),
    rating: product.rating,
    reviewCount: product.reviewCount,
    featured: product.featured,
    bestseller: product.bestseller,
    isNew: product.isNew,
    reviews: (product.reviews ?? []).map(serializeReview),
  };
}

export function serializeReview(review: Review) {
  return {
    id: review.id,
    author: review.author,
    rating: review.rating,
    title: review.title,
    body: review.body,
    date: review.createdAt.toISOString(),
    verified: review.verified,
  };
}

export function serializeCategory(category: Category) {
  return {
    slug: category.slug,
    name: category.name,
    description: category.description,
    image: category.image,
  };
}
