import { Droplet, FlaskConical, Eye, type LucideIcon } from "lucide-react";
import type { Department, ProductCategorySlug } from "./types";
import { editorial } from "./images";

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
    image: "/products/body-butter-strawberry.jpg",
  },
  {
    slug: "perfumes",
    titleKey: "pillars.perfumes.title",
    tagKey: "pillars.perfumes.tag",
    descriptionKey: "pillars.perfumes.description",
    ctaKey: "pillars.perfumes.cta",
    icon: FlaskConical,
    image: "/products/musk-oil-trio.jpg",
  },
  {
    slug: "lenses",
    titleKey: "pillars.lenses.title",
    tagKey: "pillars.lenses.tag",
    descriptionKey: "pillars.lenses.description",
    ctaKey: "pillars.lenses.cta",
    icon: Eye,
    // No real lens photography yet — reuses the same curated placeholder as
    // the homepage's Contact Lenses pillar until a real catalog exists.
    image: editorial.handEyeshadow,
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
