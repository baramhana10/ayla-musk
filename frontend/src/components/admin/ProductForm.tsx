"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { productsApi, ApiClientError } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { useCategories } from "@/lib/hooks";
import { DEPARTMENTS, CATEGORY_SLUGS_BY_DEPARTMENT } from "@/lib/departments";
import type { Product, ScentFamily, ProductVariant, Department, Gender } from "@/lib/types";
import { Input, Textarea } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import ImageUploader from "@/components/admin/ImageUploader";
import { useT } from "@/store/locale";

const scentFamilyOptions: ScentFamily[] = ["Floral Musk", "Oriental Amber", "Fresh Clean", "Sweet Gourmand", "Fruity Floral"];
const genderOptions: Gender[] = ["Women", "Men", "Unisex"];
const lensTypeOptions = ["Daily Disposable", "Weekly", "Monthly", "Colored"];

function emptyVariant(department: Department): ProductVariant {
  const id = `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return department === "lenses"
    ? { id, label: "Plano (0.00)", price: 8900, stock: 20 }
    : { id, sizeMl: 30, price: 6000, stock: 20 };
}

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const t = useT();
  const { data: categories } = useCategories();
  const [submitting, setSubmitting] = useState(false);

  const [department, setDepartment] = useState<Department>(product?.department ?? "perfumes");
  const [name, setName] = useState(product?.name ?? "");
  const [brandLine, setBrandLine] = useState(product?.brandLine ?? "");
  const [category, setCategory] = useState<string>(product?.category ?? "");
  const [accent, setAccent] = useState(product?.accent ?? "#9c5a63");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [description, setDescription] = useState(product?.description ?? "");

  // Perfumes
  const [scentFamily, setScentFamily] = useState<ScentFamily>(product?.scentFamily ?? "Floral Musk");
  const [gender, setGender] = useState<Gender>(product?.gender ?? "Women");
  const [notesTop, setNotesTop] = useState(product?.notes?.top.join(", ") ?? "");
  const [notesHeart, setNotesHeart] = useState(product?.notes?.heart.join(", ") ?? "");
  const [notesBase, setNotesBase] = useState(product?.notes?.base.join(", ") ?? "");

  // Body Care
  const [benefits, setBenefits] = useState(product?.benefits?.join("\n") ?? "");
  const [ingredients, setIngredients] = useState(product?.ingredients?.join(", ") ?? "");
  const [howToUse, setHowToUse] = useState(product?.howToUse ?? "");
  const [skinHairType, setSkinHairType] = useState(product?.skinHairType ?? "");

  // Contact Lenses
  const [lensType, setLensType] = useState(product?.lensType ?? lensTypeOptions[0]);
  const [lensColor, setLensColor] = useState(product?.lensColor ?? "");
  const [diameter, setDiameter] = useState(product?.diameter ?? "14.2mm");
  const [baseCurve, setBaseCurve] = useState(product?.baseCurve ?? "8.6mm");
  const [replacementDuration, setReplacementDuration] = useState(product?.replacementDuration ?? "");
  const [material, setMaterial] = useState(product?.material ?? "");
  const [waterContent, setWaterContent] = useState(product?.waterContent ?? "");
  const [prescriptionAvailable, setPrescriptionAvailable] = useState(product?.prescriptionAvailable ?? false);

  const [imageUrls, setImageUrls] = useState<string[]>(product?.images ?? []);
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants ?? [emptyVariant(department)]);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [bestseller, setBestseller] = useState(product?.bestseller ?? false);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);

  const categoryOptions = categories.filter((c) => CATEGORY_SLUGS_BY_DEPARTMENT[department].includes(c.slug));

  function changeDepartment(next: Department) {
    setDepartment(next);
    // A category from the old department is meaningless once the department
    // changes, and lenses has no sub-category taxonomy at all.
    setCategory("");
    if (next === "lenses" && variants.every((v) => v.sizeMl && !v.label)) {
      setVariants(variants.map((v) => ({ ...v, sizeMl: undefined, label: v.label || "Plano (0.00)" })));
    }
  }

  function updateVariant(id: string, patch: Partial<ProductVariant>) {
    setVariants((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !shortDescription.trim() || variants.length === 0) {
      toast.error(t("admin.products.form.fillRequired"));
      return;
    }

    const payload = {
      name,
      slug: product?.slug ?? slugify(name),
      brandLine: brandLine || undefined,
      department,
      category: department === "lenses" ? null : category || null,
      accent,
      shortDescription,
      description,

      scentFamily: department === "perfumes" ? scentFamily : null,
      gender: department === "perfumes" ? gender : null,
      notes:
        department === "perfumes"
          ? {
              top: notesTop.split(",").map((s) => s.trim()).filter(Boolean),
              heart: notesHeart.split(",").map((s) => s.trim()).filter(Boolean),
              base: notesBase.split(",").map((s) => s.trim()).filter(Boolean),
            }
          : null,

      benefits: department === "body-care" ? benefits.split("\n").map((s) => s.trim()).filter(Boolean) : null,
      ingredients: department === "body-care" ? ingredients.split(",").map((s) => s.trim()).filter(Boolean) : null,
      howToUse: department === "body-care" ? howToUse || undefined : null,
      skinHairType: department === "body-care" ? skinHairType || undefined : null,

      lensType: department === "lenses" ? lensType : null,
      lensColor: department === "lenses" ? lensColor || undefined : null,
      diameter: department === "lenses" ? diameter || undefined : null,
      baseCurve: department === "lenses" ? baseCurve || undefined : null,
      replacementDuration: department === "lenses" ? replacementDuration || undefined : null,
      material: department === "lenses" ? material || undefined : null,
      waterContent: department === "lenses" ? waterContent || undefined : null,
      prescriptionAvailable: department === "lenses" ? prescriptionAvailable : false,

      images: imageUrls,
      variants: variants.map((v) => ({
        id: v.id.startsWith("new-") ? undefined : v.id,
        label: v.label || undefined,
        sizeMl: v.sizeMl || undefined,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        stock: v.stock,
      })),
      featured,
      bestseller,
      isNew,
    };

    setSubmitting(true);
    try {
      if (product) {
        await productsApi.update(product.id, payload);
      } else {
        await productsApi.create(payload);
      }
      toast.success(`${name} ${product ? t("admin.products.form.updated") : t("admin.products.form.created")}`);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : t("admin.products.form.saveError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Department drives every field set below it — the single switch that
          makes this one form instead of three disconnected ones. */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/50">{t("admin.products.form.department")}</p>
        <div className="flex flex-wrap gap-2">
          {DEPARTMENTS.map((d) => (
            <button
              key={d.slug}
              type="button"
              onClick={() => changeDepartment(d.slug)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                department === d.slug ? "border-deep-rose bg-deep-rose text-ivory" : "border-charcoal/20 text-charcoal/70 hover:border-deep-rose"
              }`}
            >
              <d.icon size={15} /> {t(d.titleKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input label={t("admin.products.form.productName")} value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label={t("admin.products.form.brandLine")} value={brandLine} onChange={(e) => setBrandLine(e.target.value)} />
        {department !== "lenses" && (
          <Select label={t("admin.products.form.category")} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">{t("admin.products.form.noCategory")}</option>
            {categoryOptions.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </Select>
        )}
        {department === "perfumes" && (
          <>
            <Select label={t("admin.products.form.scentFamily")} value={scentFamily} onChange={(e) => setScentFamily(e.target.value as ScentFamily)}>
              {scentFamilyOptions.map((f) => <option key={f} value={f}>{t(`filters.families.${f}`)}</option>)}
            </Select>
            <Select label={t("admin.products.form.gender")} value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
              {genderOptions.map((g) => <option key={g} value={g}>{g}</option>)}
            </Select>
          </>
        )}
        {department === "body-care" && (
          <Input label={t("admin.products.form.skinHairType")} value={skinHairType} onChange={(e) => setSkinHairType(e.target.value)} placeholder="All skin types" />
        )}
        {department === "lenses" && (
          <>
            <Select label={t("admin.products.form.lensType")} value={lensType} onChange={(e) => setLensType(e.target.value)}>
              {lensTypeOptions.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
            <Input label={t("admin.products.form.lensColor")} value={lensColor} onChange={(e) => setLensColor(e.target.value)} placeholder="Gray" />
          </>
        )}
        <div>
          <label className="mb-1.5 block text-xs font-medium tracking-wide text-charcoal/70">{t("admin.products.form.accentColor")}</label>
          <div className="flex items-center gap-3">
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-charcoal/15" />
            <span className="text-sm text-charcoal/60">{accent}</span>
          </div>
        </div>
      </div>

      <Input label={t("admin.products.form.shortDescription")} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required />
      <Textarea label={t("admin.products.form.fullDescription")} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />

      {department === "perfumes" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label={t("admin.products.form.topNotes")} value={notesTop} onChange={(e) => setNotesTop(e.target.value)} />
          <Input label={t("admin.products.form.heartNotes")} value={notesHeart} onChange={(e) => setNotesHeart(e.target.value)} />
          <Input label={t("admin.products.form.baseNotes")} value={notesBase} onChange={(e) => setNotesBase(e.target.value)} />
        </div>
      )}

      {department === "body-care" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Textarea label={t("admin.products.form.benefits")} rows={3} value={benefits} onChange={(e) => setBenefits(e.target.value)} />
          <Input label={t("admin.products.form.ingredients")} value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
          <Textarea label={t("admin.products.form.howToUse")} rows={2} value={howToUse} onChange={(e) => setHowToUse(e.target.value)} className="sm:col-span-2" />
        </div>
      )}

      {department === "lenses" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label={t("admin.products.form.diameter")} value={diameter} onChange={(e) => setDiameter(e.target.value)} />
          <Input label={t("admin.products.form.baseCurve")} value={baseCurve} onChange={(e) => setBaseCurve(e.target.value)} />
          <Input label={t("admin.products.form.replacementDuration")} value={replacementDuration} onChange={(e) => setReplacementDuration(e.target.value)} placeholder="Daily / Monthly" />
          <Input label={t("admin.products.form.material")} value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Silicone Hydrogel" />
          <Input label={t("admin.products.form.waterContent")} value={waterContent} onChange={(e) => setWaterContent(e.target.value)} placeholder="42%" />
          <label className="flex items-center gap-2 self-end pb-3 text-sm text-charcoal/70 cursor-pointer">
            <input type="checkbox" checked={prescriptionAvailable} onChange={(e) => setPrescriptionAvailable(e.target.checked)} className="h-4 w-4 accent-[#9c5a63] cursor-pointer" />
            {t("admin.products.form.prescriptionAvailable")}
          </label>
        </div>
      )}

      <ImageUploader value={imageUrls} onChange={setImageUrls} />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/50">{t("admin.products.form.variants")}</p>
          <button type="button" onClick={() => setVariants((v) => [...v, emptyVariant(department)])} className="flex items-center gap-1 text-xs text-deep-rose hover:underline cursor-pointer">
            <Plus size={13} /> {t("admin.products.form.addVariant")}
          </button>
        </div>
        <div className="space-y-3">
          {variants.map((v) => (
            <div key={v.id} className="grid grid-cols-2 gap-3 rounded-xl border border-charcoal/10 p-4 sm:grid-cols-5 sm:items-end">
              {department === "lenses" ? (
                <Input label={t("admin.products.form.variantLabel")} value={v.label ?? ""} onChange={(e) => updateVariant(v.id, { label: e.target.value })} />
              ) : (
                <Input label={t("admin.products.form.sizeMl")} type="number" value={v.sizeMl ?? ""} onChange={(e) => updateVariant(v.id, { sizeMl: e.target.value ? Number(e.target.value) : undefined })} />
              )}
              <Input label={t("admin.products.form.priceCents")} type="number" value={v.price} onChange={(e) => updateVariant(v.id, { price: Number(e.target.value) })} />
              <Input label={t("admin.products.form.compareAt")} type="number" value={v.compareAtPrice ?? ""} onChange={(e) => updateVariant(v.id, { compareAtPrice: e.target.value ? Number(e.target.value) : undefined })} />
              <Input label={t("admin.products.form.stock")} type="number" value={v.stock} onChange={(e) => updateVariant(v.id, { stock: Number(e.target.value) })} />
              <button
                type="button"
                onClick={() => setVariants((vs) => vs.filter((x) => x.id !== v.id))}
                disabled={variants.length === 1}
                className="flex h-11 items-center justify-center gap-1 rounded-lg border border-charcoal/15 text-xs text-charcoal/50 hover:border-wine hover:text-wine disabled:opacity-30 cursor-pointer"
              >
                <Trash2 size={13} /> {t("admin.products.form.remove")}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        {[
          { label: t("admin.products.form.featured"), checked: featured, set: setFeatured },
          { label: t("admin.products.form.bestseller"), checked: bestseller, set: setBestseller },
          { label: t("admin.products.form.newArrival"), checked: isNew, set: setIsNew },
        ].map((f) => (
          <label key={f.label} className="flex items-center gap-2 text-sm text-charcoal/70 cursor-pointer">
            <input type="checkbox" checked={f.checked} onChange={(e) => f.set(e.target.checked)} className="h-4 w-4 accent-[#9c5a63] cursor-pointer" />
            {f.label}
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? t("admin.products.form.saving") : product ? t("admin.products.form.saveChanges") : t("admin.products.form.createProduct")}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.push("/admin/products")}>{t("common.cancel")}</Button>
      </div>
    </form>
  );
}
