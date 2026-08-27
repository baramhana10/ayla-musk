"use client";

import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { Product } from "@/lib/types";
import ProductGallery from "@/components/product/ProductGallery";
import NotesPyramid from "@/components/product/NotesPyramid";
import BodyCareDetails from "@/components/product/BodyCareDetails";
import LensSpecs from "@/components/product/LensSpecs";
import AddToCartPanel from "@/components/product/AddToCartPanel";
import ReviewsSection from "@/components/product/ReviewsSection";
import RelatedProducts from "@/components/product/RelatedProducts";
import Accordion, { AccordionItem } from "@/components/ui/Accordion";
import Badge from "@/components/ui/Badge";
import { useT, useLocale } from "@/store/locale";

export default function ProductPageContent({ product, related }: { product: Product; related: Product[] }) {
  const t = useT();
  const locale = useLocale();
  const Chevron = locale === "ar" ? ChevronLeft : ChevronRight;

  return (
    <div>
      <div className="container-luxe pt-6">
        <nav className="flex items-center gap-1.5 text-xs text-charcoal/45">
          <Link href="/" className="hover:text-deep-rose">{t("product.breadcrumbHome")}</Link>
          <Chevron size={12} />
          <Link href="/shop" className="hover:text-deep-rose">{t("product.breadcrumbShop")}</Link>
          <Chevron size={12} />
          <span className="text-charcoal/70">{product.name}</span>
        </nav>
      </div>

      <div className="container-luxe grid grid-cols-1 gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-14">
        <ProductGallery product={product} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.bestseller && <Badge variant="gold">{t("product.bestseller")}</Badge>}
            {product.isNew && <Badge>{t("product.new")}</Badge>}
            {product.scentFamily && (
              <span className="text-xs uppercase tracking-[0.15em] text-charcoal/45">{product.scentFamily}</span>
            )}
            {product.gender && <span className="text-xs uppercase tracking-[0.15em] text-charcoal/45">{product.gender}</span>}
            {product.skinHairType && (
              <span className="text-xs uppercase tracking-[0.15em] text-charcoal/45">{product.skinHairType}</span>
            )}
          </div>
          <h1 className="mt-3 font-display text-4xl text-charcoal sm:text-5xl">{product.name}</h1>
          <p className="mt-3 text-base text-charcoal/60">{product.shortDescription}</p>

          <div className="mt-8">
            <AddToCartPanel product={product} />
          </div>

          <div className="mt-10">
            <Accordion>
              <AccordionItem title={t("product.description")} defaultOpen>
                <p>{product.description}</p>
              </AccordionItem>
              {product.department === "perfumes" && product.notes && (
                <AccordionItem title={t("product.fragranceNotes")}>
                  <NotesPyramid notes={product.notes} accent={product.accent} />
                </AccordionItem>
              )}
              {product.department === "body-care" && (
                <AccordionItem title={t("product.benefitsIngredients")} defaultOpen>
                  <BodyCareDetails product={product} />
                </AccordionItem>
              )}
              {product.department === "lenses" && (
                <AccordionItem title={t("product.lensSpecifications")} defaultOpen>
                  <LensSpecs product={product} />
                </AccordionItem>
              )}
              <AccordionItem title={t("product.shippingReturns")}>
                <p>{t("product.shippingReturnsBody")}</p>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      <div className="container-luxe border-t border-charcoal/10 py-16">
        <h2 className="mb-2 text-center font-display text-3xl text-charcoal">{t("product.reviewsTitle")}</h2>
        <p className="mb-10 text-center text-sm text-charcoal/50">{t("product.reviewsSubtitle")} {product.name}</p>
        <div className="mx-auto max-w-3xl">
          <ReviewsSection productId={product.id} initialReviews={product.reviews} averageRating={product.rating} />
        </div>
      </div>

      <RelatedProducts products={related} />
    </div>
  );
}
