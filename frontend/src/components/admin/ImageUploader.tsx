"use client";

import { useRef, useState } from "react";
import { Loader2, Star, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage, ApiClientError } from "@/lib/api";
import { useT } from "@/store/locale";

/**
 * Admin image picker. Files are uploaded straight to Cloudinary (signed by our
 * backend) and only the resulting HTTPS URLs are kept in `value` — nothing is
 * stored on our own server. The first URL is treated as the primary photo.
 *
 * A plain-text field is still offered for pasting an existing URL by hand.
 */
export default function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pasted, setPasted] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    const added: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name}: ${t("admin.products.form.uploadNotImage")}`);
          continue;
        }
        try {
          added.push(await uploadImage(file));
        } catch (err) {
          toast.error(err instanceof ApiClientError ? err.message : t("admin.products.form.uploadFailed"));
        }
      }
      if (added.length) onChange([...value, ...added]);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function addPasted() {
    const url = pasted.trim();
    if (!url) return;
    onChange([...value, url]);
    setPasted("");
  }

  function removeAt(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function makePrimary(i: number) {
    if (i === 0) return;
    const next = [...value];
    const [picked] = next.splice(i, 1);
    next.unshift(picked);
    onChange(next);
  }

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-xs font-medium tracking-wide text-charcoal/70">
        {t("admin.products.form.images")}
      </label>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-charcoal/25 bg-ivory px-4 py-6 text-sm text-charcoal/60 transition-colors hover:border-deep-rose hover:text-deep-rose disabled:opacity-60"
      >
        {busy ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
        {busy ? t("admin.products.form.uploading") : t("admin.products.form.uploadCta")}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="mt-2 flex gap-2">
        <input
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addPasted();
            }
          }}
          placeholder={t("admin.products.form.pasteUrl")}
          className="w-full rounded-lg border border-charcoal/15 bg-ivory px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/35 outline-none focus:border-deep-rose focus:ring-1 focus:ring-deep-rose/40"
        />
        <button
          type="button"
          onClick={addPasted}
          className="shrink-0 rounded-lg border border-charcoal/15 px-3 text-xs text-charcoal/70 hover:border-deep-rose hover:text-deep-rose"
        >
          {t("common.add")}
        </button>
      </div>

      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {value.map((src, i) => (
            <div key={`${src}-${i}`} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary URL, not a next/image asset */}
              <img
                src={src}
                alt=""
                className="h-20 w-20 rounded-lg border border-charcoal/10 object-cover"
              />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-charcoal/80 px-1 text-[10px] font-medium text-ivory">
                  {t("admin.products.form.primary")}
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-wine p-0.5 text-ivory opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={t("common.delete")}
              >
                <X size={12} />
              </button>
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => makePrimary(i)}
                  className="absolute bottom-1 left-1 rounded bg-charcoal/70 p-0.5 text-ivory opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={t("admin.products.form.makePrimary")}
                >
                  <Star size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
