"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { categoriesApi, ApiClientError } from "@/lib/api";
import type { Category } from "@/lib/types";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUploader from "@/components/admin/ImageUploader";
import { editorial } from "@/lib/images";
import { useT } from "@/store/locale";

const imagePool = Object.values(editorial);

export default function AdminCategoriesPage() {
  const t = useT();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Category | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function load() {
    setLoading(true);
    categoriesApi.list().then((res) => setCategories(res.categories)).finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load calls setLoading synchronously inside load()
  useEffect(load, []);

  if (loading) return null;

  function startNew() {
    setEditing({ slug: "" as Category["slug"], name: "", description: "", image: imagePool[Math.floor(Math.random() * imagePool.length)] });
    setIsNewCategory(true);
    setName("");
    setDescription("");
  }

  function startEdit(c: Category) {
    setEditing(c);
    setIsNewCategory(false);
    setName(c.name);
    setDescription(c.description);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !name.trim()) return;
    try {
      if (isNewCategory) {
        await categoriesApi.create({ name, description, image: editing.image });
      } else {
        await categoriesApi.update(editing.slug, { name, description, image: editing.image });
      }
      toast.success(`${name} ${t("admin.categories.saved")}`);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : t("admin.categories.saveError"));
    }
  }

  async function handleDelete(c: Category) {
    try {
      await categoriesApi.remove(c.slug);
      toast.success(`${c.name} ${t("admin.categories.removed")}`);
      setCategories((cs) => cs.filter((x) => x.slug !== c.slug));
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : t("admin.categories.removeError"));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-charcoal">{t("admin.categories.title")}</h1>
          <p className="mt-1 text-sm text-charcoal/50">{categories.length} {t("admin.categories.subtitle")}</p>
        </div>
        <Button onClick={startNew}><Plus size={15} /> {t("admin.categories.addCategory")}</Button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="mt-6 max-w-lg space-y-4 rounded-2xl border border-charcoal/10 bg-ivory p-6">
          <Input label={t("admin.categories.name")} value={name} onChange={(e) => setName(e.target.value)} required />
          <Textarea label={t("admin.categories.description")} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          <ImageUploader
            value={editing.image ? [editing.image] : []}
            onChange={(urls) => setEditing({ ...editing, image: urls[urls.length - 1] ?? "" })}
          />
          <div className="flex gap-3">
            <Button type="submit">{t("common.save")}</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>{t("common.cancel")}</Button>
          </div>
        </form>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.slug} className="overflow-hidden rounded-2xl border border-charcoal/10 bg-ivory">
            <div className="relative h-28 w-full">
              <Image src={c.image} alt={c.name} fill sizes="33vw" className="object-cover" />
            </div>
            <div className="p-4">
              <p className="font-display text-lg text-charcoal">{c.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-charcoal/50">{c.description}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => startEdit(c)} className="flex items-center gap-1 text-xs text-deep-rose hover:underline cursor-pointer">
                  <Pencil size={12} /> {t("common.edit")}
                </button>
                <button onClick={() => handleDelete(c)} className="flex items-center gap-1 text-xs text-charcoal/40 hover:text-wine cursor-pointer">
                  <Trash2 size={12} /> {t("common.delete")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
