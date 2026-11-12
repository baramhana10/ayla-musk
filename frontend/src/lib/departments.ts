import { Droplet, FlaskConical, Eye, type LucideIcon } from "lucide-react";
import type { Department, ProductCategorySlug } from "./types";

/**
 * Single source of truth for the site's 3 departments. Every place that
 * lists, links to, or filters by department — the homepage pillars, the
 * categories page, the shop filter, the navbar, the mobile menu, the bottom
 * tab bar's categories sheet, and the admin product form — reads from this
 * one array so the three stay in lockstep instead of drifting apart as
 * separate hardcoded lists.
 */
export interface DepartmentDef {
  slug: Department;
  /** Dictionary key for the display name — reuses the homepage pillar copy. */
  titleKey: string;
  tagKey: string;
  descriptionKey: string;
  ctaKey: string;
  icon: LucideIcon;
  image: string;
}

export const DEPARTMENTS: DepartmentDef[] = [
  {
    slug: "body-care",
    titleKey: "pillars.bodyCare.title",
    tagKey: "pillars.bodyCare.tag",
    descriptionKey: "pillars.bodyCare.description",
    ctaKey: "pillars.bodyCare.cta",
    icon: Droplet,
    image: "https://res.cloudinary.com/drhwhjav/image/upload/v1791032109/aylamusk/81ed081a-0f14-4f15-aba4-67edfe738013.webp",
  },
  {
    slug: "perfumes",
    titleKey: "pillars.perfumes.title",
    tagKey: "pillars.perfumes.tag",
    descriptionKey: "pillars.perfumes.description",
    ctaKey: "pillars.perfumes.cta",
    icon: FlaskConical,
    image: "https://res.cloudinary.com/drhwhjav/image/upload/v1791032111/aylamusk/4efc7c8b-cba7-451e-b13a-80b3d0dbd6f7.webp",
  },
  {
    slug: "lenses",
    titleKey: "pillars.lenses.title",
    tagKey: "pillars.lenses.tag",
    descriptionKey: "pillars.lenses.description",
    ctaKey: "pillars.lenses.cta",
    icon: Eye,
    // Curated luxury lens campaign image served from Cloudinary.
    image: "https://res.cloudinary.com/drhwhjav/image/upload/v1791032112/aylamusk/5918004b-a28f-4224-9eb8-f2188a51a80f.webp",
  },
];

export function departmentHref(slug: Department) {
  return `/shop?department=${slug}`;
}

/** Which sub-categories (from the Category table) belong to each department
 *  — Contact Lenses has no sub-category taxonomy of its own. Used by the
 *  shop filter and the admin product form to scope the category picker to
 *  whichever department is selected. */
export const CATEGORY_SLUGS_BY_DEPARTMENT: Record<Department, ProductCategorySlug[]> = {
  "body-care": ["body-butter", "body-scrub", "hair-body-care"],
  perfumes: ["musk-oil", "gift-sets"],
  lenses: [],
};
