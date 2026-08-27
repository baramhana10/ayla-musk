"use client";

import Image from "next/image";
import { Leaf, HeartHandshake, Sparkles, Recycle } from "lucide-react";
import { editorial } from "@/lib/images";
import SectionHeading from "@/components/ui/SectionHeading";
import { useT } from "@/store/locale";

export default function AboutContent() {
  const t = useT();

  const values = [
    { icon: Sparkles, title: t("about.v1t"), body: t("about.v1d") },
    { icon: Leaf, title: t("about.v2t"), body: t("about.v2d") },
    { icon: HeartHandshake, title: t("about.v3t"), body: t("about.v3d") },
    { icon: Recycle, title: t("about.v4t"), body: t("about.v4d") },
  ];

  return (
    <div>
      <div className="relative h-[52svh] min-h-[26rem] w-full overflow-hidden">
        <Image src={editorial.pinkHairPortrait} alt="Ayla Musk founder story" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne-light">{t("about.eyebrow")}</span>
          <h1 className="mt-3 font-display text-4xl text-ivory sm:text-5xl">{t("about.title")}</h1>
        </div>
      </div>

      <div className="container-luxe py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-lg leading-relaxed text-charcoal/70">
            {t("about.intro")}
          </p>
        </div>

        <SectionHeading eyebrow={t("about.valuesEyebrow")} title={t("about.valuesTitle")} className="mt-24" />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-charcoal/10 p-6 text-center">
              <v.icon size={22} className="mx-auto text-deep-rose" />
              <p className="mt-4 font-display text-lg text-charcoal">{v.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/55">{v.body}</p>
            </div>
          ))}
        </div>

        <div id="ingredients" className="mt-24 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src={editorial.dropperEucalyptus} alt="Ayla Musk ingredients" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-deep-rose">{t("about.ingredientsEyebrow")}</span>
            <h2 className="mt-4 font-display text-3xl text-charcoal sm:text-4xl">{t("about.ingredientsTitle")}</h2>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/60">
              {t("about.ingredientsBody")}
            </p>
          </div>
        </div>

        <div id="sustainability" className="mt-24 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-deep-rose">{t("about.sustainabilityEyebrow")}</span>
            <h2 className="mt-4 font-display text-3xl text-charcoal sm:text-4xl">{t("about.sustainabilityTitle")}</h2>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/60">
              {t("about.sustainabilityBody")}
            </p>
          </div>
          <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-3xl lg:order-2">
            <Image src={editorial.brushesInCup} alt="Ayla Musk sustainable practices" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
