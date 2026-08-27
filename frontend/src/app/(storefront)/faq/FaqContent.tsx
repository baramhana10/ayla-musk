"use client";

import Accordion, { AccordionItem } from "@/components/ui/Accordion";
import { useT } from "@/store/locale";

export default function FaqContent() {
  const t = useT();

  const groups = [
    {
      title: t("faq.groups.orders"),
      items: [
        { q: t("faq.q1"), a: t("faq.a1") },
        { q: t("faq.q2"), a: t("faq.a2") },
      ],
    },
    {
      title: t("faq.groups.shipping"),
      id: "shipping",
      items: [
        { q: t("faq.q3"), a: t("faq.a3") },
        { q: t("faq.q4"), a: t("faq.a4") },
        { q: t("faq.q5"), a: t("faq.a5") },
      ],
    },
    {
      title: t("faq.groups.product"),
      items: [
        { q: t("faq.q6"), a: t("faq.a6") },
        { q: t("faq.q7"), a: t("faq.a7") },
        { q: t("faq.q8"), a: t("faq.a8") },
      ],
    },
  ];

  return (
    <div className="container-luxe py-14 sm:py-20">
      <div className="mx-auto max-w-lg text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-deep-rose">{t("faq.eyebrow")}</span>
        <h1 className="mt-3 font-display text-4xl text-charcoal sm:text-5xl">{t("faq.title")}</h1>
      </div>

      <div className="mx-auto mt-14 max-w-2xl space-y-12">
        {groups.map((group) => (
          <div key={group.title} id={group.id}>
            <h2 className="mb-2 font-display text-2xl text-charcoal">{group.title}</h2>
            <Accordion>
              {group.items.map((item) => (
                <AccordionItem key={item.q} title={item.q}>
                  <p>{item.a}</p>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
