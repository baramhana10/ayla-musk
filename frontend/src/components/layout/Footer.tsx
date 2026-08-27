"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { InstagramIcon, FacebookIcon, XIcon } from "@/components/ui/SocialIcons";
import { useT } from "@/store/locale";
import { DEPARTMENTS, departmentHref } from "@/lib/departments";

export default function Footer() {
  const t = useT();
  const [email, setEmail] = useState("");

  const columns = [
    {
      title: t("footer.shop"),
      links: [
        { label: t("filters.allProducts"), href: "/categories" },
        ...DEPARTMENTS.map((d) => ({ label: t(d.titleKey), href: departmentHref(d.slug) })),
        { label: t("footer.bestsellers"), href: "/shop?sort=bestselling" },
      ],
    },
    {
      title: t("footer.clientCare"),
      links: [
        { label: t("footer.contactUs"), href: "/contact" },
        { label: t("footer.faq"), href: "/faq" },
        { label: t("footer.shippingReturns"), href: "/faq#shipping" },
      ],
    },
    {
      title: t("footer.theHouse"),
      links: [
        { label: t("footer.ourStory"), href: "/about" },
        { label: t("footer.ingredients"), href: "/about#ingredients" },
        { label: t("footer.sustainability"), href: "/about#sustainability" },
      ],
    },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error(t("newsletter.invalidEmail"));
      return;
    }
    toast.success(t("newsletter.footerSubscribed"));
    setEmail("");
  }

  return (
    <footer className="mt-24 bg-charcoal text-ivory/90">
      <div className="container-luxe py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="font-display text-2xl tracking-[0.18em] text-ivory">AYLA MUSK</span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/55">{t("footer.tagline")}</p>
            <form onSubmit={handleSubmit} className="mt-6 max-w-sm">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-champagne">{t("newsletter.footerJoin")}</p>
              <div className="flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/5 pe-1.5 ps-4 py-1.5 focus-within:border-champagne transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("newsletter.footerPlaceholder")}
                  className="flex-1 bg-transparent text-sm text-ivory placeholder:text-ivory/35 outline-none"
                />
                <button
                  type="submit"
                  aria-label={t("newsletter.subscribe")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-champagne text-charcoal transition-transform hover:scale-105 cursor-pointer shrink-0"
                >
                  <ArrowRight size={14} className="rtl:-scale-x-100" />
                </button>
              </div>
            </form>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-ivory/45">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-ivory/70 hover:text-champagne transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col-reverse items-center justify-between gap-6 border-t border-ivory/10 pt-8 sm:flex-row">
          <p className="text-xs text-ivory/40">© {new Date().getFullYear()} Ayla Musk. {t("footer.rights")}</p>
          <div className="flex items-center gap-4">
            <Link href="#" aria-label="Instagram" className="text-ivory/50 hover:text-champagne transition-colors"><InstagramIcon size={17} /></Link>
            <Link href="#" aria-label="Facebook" className="text-ivory/50 hover:text-champagne transition-colors"><FacebookIcon size={17} /></Link>
            <Link href="#" aria-label="X" className="text-ivory/50 hover:text-champagne transition-colors"><XIcon size={17} /></Link>
          </div>
          <div className="flex items-center gap-5 text-xs text-ivory/40">
            <Link href="/admin" className="hover:text-champagne transition-colors">{t("common.admin")}</Link>
            <span>{t("common.privacy")}</span>
            <span>{t("common.terms")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
