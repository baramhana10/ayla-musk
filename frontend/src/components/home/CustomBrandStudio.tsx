"use client";

import { useId, useState } from "react";
import { ArrowUpLeft, Check, MessageCircle, PenLine } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import PerfumeBottle from "@/components/visuals/PerfumeBottle";

const palettes = [
  { name: "وردي هادئ", ink: "#78454d", paper: "#edd6d2", accent: "#a96670" },
  { name: "أخضر زيتوني", ink: "#404b3c", paper: "#dde0d1", accent: "#7d8b68" },
  { name: "عنبر دافئ", ink: "#69452e", paper: "#eddbc1", accent: "#b58a56" },
] as const;

export default function CustomBrandStudio() {
  const inputId = useId();
  const reducedMotion = useReducedMotion();
  const [name, setName] = useState("");
  const [paletteIndex, setPaletteIndex] = useState(0);
  const palette = palettes[paletteIndex];
  const brandName = name.trim() || "اسم علامتك";
  const enquiry = `مرحباً أيلا مَسك، أرغب في تصميم علامتي الخاصة.\nاسم العلامة: ${name.trim() || "لم أحدده بعد"}\nالألوان المفضلة: ${palette.name}\nفكرتي ومتطلباتي: `;
  const whatsappHref = `https://wa.me/971529875533?text=${encodeURIComponent(enquiry)}`;

  return (
    <section dir="rtl" aria-labelledby="custom-brand-title" className="relative overflow-hidden bg-[var(--hw-cream)] py-20 text-[var(--hw-ink)] sm:py-28">
      <div className="container-luxe">
        <div className="mb-10 flex items-center gap-4 text-xs text-[var(--hw-brown)] sm:mb-14">
          <span dir="ltr" className="font-display">04</span>
          <span className="h-px w-12 bg-[var(--hw-tan)]" />
          <span>استوديو العلامات الخاصة</span>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65 }}
          >
            <p className="mb-5 text-sm text-[var(--hw-brown)]">براندك من الألف إلى الياء.</p>
            <h2 id="custom-brand-title" className="text-[clamp(2.4rem,5vw,4.5rem)] font-medium leading-[1.35] tracking-tight">
              اسمك على العبوة.<br />
              <span className="text-[var(--hw-brown)]">بصمتك في كل تفصيل.</span>
            </h2>
            <p className="mt-6 max-w-lg text-[15px] leading-[2] text-[var(--hw-brown-deep)]/80 sm:text-base">
              <span className="mb-3 block text-lg font-medium text-[var(--hw-ink)] sm:text-xl">نساعدك تبني براندك، من أول فكرة حتى المنتج الجاهز.</span>
              مع أيلا مَسك، نرافقك في كل خطوة: من اختيار الاسم وتطوير الهوية البصرية، إلى تصميم العبوة والتغليف وتجهيز منتج يحمل اسمك. كل تفصيل نطوّره معك ليعكس رؤيتك ويمنح علامتك بصمتها الخاصة.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-y border-[var(--hw-line)] py-5 text-sm">
              {["اسم تختاره", "هوية تميّزك", "تغليف على ذوقك"].map((detail) => (
                <span key={detail} className="inline-flex items-center gap-2">
                  <Check size={14} className="text-[var(--hw-brown)]" />{detail}
                </span>
              ))}
            </div>

            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="تواصل معنا عبر واتساب لتصميم علامتك الخاصة" className="group mt-8 inline-flex min-h-14 items-center justify-center gap-4 rounded-full bg-[#176b45] px-7 text-sm text-white transition-colors hover:bg-[#115437] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#176b45]">
              <MessageCircle size={19} aria-hidden="true" />
              ابدأ علامتك عبر واتساب
              <ArrowUpLeft size={18} className="transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 motion-reduce:transform-none" />
            </a>
            <p className="mt-3 text-xs leading-relaxed text-[var(--hw-brown)]">شاركنا فكرتك، ولنرسم ملامحها معاً.</p>
          </motion.div>

          <div className="overflow-hidden rounded-[2rem] border border-[var(--hw-line)] bg-[var(--hw-white)] shadow-warm">
            <div className="flex items-center justify-between border-b border-[var(--hw-line)] px-5 py-4 text-xs sm:px-7">
              <span className="inline-flex items-center gap-2 text-[var(--hw-brown-deep)]"><PenLine size={14} /> مساحة لفكرتك</span>
              <span className="text-[var(--hw-brown)]">جرّب اسم علامتك</span>
            </div>

            <div className="relative isolate flex h-[310px] items-end justify-center overflow-hidden px-5 pb-8 sm:h-[385px]" style={{ background: `radial-gradient(ellipse at 50% 25%, #fffdfa 0%, ${palette.paper} 100%)` }}>
              <div aria-hidden="true" className="absolute bottom-5 left-1/2 h-10 w-[75%] -translate-x-1/2 rounded-[50%] bg-black/10 blur-xl" />
              <div aria-hidden="true" className="absolute inset-6 rounded-t-full border border-white/50 sm:inset-9" />

              <div aria-hidden="true" className="relative mb-2 flex h-[205px] w-[130px] -rotate-6 flex-col justify-between border border-white/40 p-4 shadow-[12px_16px_24px_-12px_rgba(58,42,30,0.35)] transition-colors duration-500 sm:h-[265px] sm:w-[170px] sm:p-5" style={{ backgroundColor: palette.paper, color: palette.ink }}>
                <span dir="ltr" className="text-[8px] tracking-[0.2em]">SIGNATURE COLLECTION</span>
                <div className="border-y py-5 text-center" style={{ borderColor: `${palette.ink}35` }}>
                  <span className="block break-words text-lg font-medium leading-relaxed sm:text-xl">{brandName}</span>
                  <span className="mt-2 block text-[9px]">تفاصيل تشبهك</span>
                </div>
                <span dir="ltr" className="text-[8px] tracking-[0.16em]">DESIGNED FOR YOU</span>
              </div>

              <div className="relative -mr-6 h-[245px] w-[147px] rotate-6 sm:-mr-8 sm:h-[310px] sm:w-[186px]">
                <PerfumeBottle accent={palette.accent} label={brandName} showLabel={false} />
                <div aria-hidden="true" className="absolute left-[34%] top-[55.5%] flex min-h-[14%] w-[32%] flex-col items-center justify-center rounded-sm border bg-[#fffaf3]/95 px-0.5 py-1 text-center" style={{ borderColor: `${palette.accent}65`, color: palette.ink }}>
                  <span className="w-full break-words text-[7px] font-medium leading-[1.4] sm:text-[8px]">{brandName}</span>
                  <span className="mt-1 text-[4px] sm:text-[5px]">صُمّمت برؤيتك</span>
                </div>
              </div>
              <span className="absolute bottom-3 left-5 text-[10px] text-[var(--hw-brown-deep)]/65">تصوّر أولي للإلهام</span>
            </div>

            <div className="space-y-5 px-5 py-6 sm:px-7">
              <div>
                <label htmlFor={inputId} className="mb-2 block text-xs font-medium text-[var(--hw-brown-deep)]">ما اسم علامتك؟</label>
                <input id={inputId} value={name} onChange={(event) => setName(event.target.value)} maxLength={24} placeholder="اكتب الاسم… وشاهد فكرتك تبدأ" className="h-12 w-full rounded-xl border border-[var(--hw-line)] bg-[var(--hw-cream)] px-4 text-sm outline-none transition-shadow placeholder:text-[var(--hw-brown)]/65 focus:border-[var(--hw-brown)] focus:ring-2 focus:ring-[var(--hw-tan)]/20" />
              </div>
              <fieldset className="flex flex-wrap items-center gap-3">
                <legend className="mb-2 text-xs font-medium text-[var(--hw-brown-deep)]">اختر روح الألوان</legend>
                {palettes.map((choice, index) => (
                  <label key={choice.name} className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--hw-brown)]" style={{ borderColor: paletteIndex === index ? choice.ink : "var(--hw-line)", color: choice.ink }}>
                    <input type="radio" name={`palette-${inputId}`} value={index} checked={paletteIndex === index} onChange={() => setPaletteIndex(index)} className="sr-only" />
                    <span className="flex h-4 w-4 items-center justify-center rounded-full" style={{ backgroundColor: choice.accent }}>{paletteIndex === index && <Check size={10} className="text-white" />}</span>
                    {choice.name}
                  </label>
                ))}
              </fieldset>
              <p className="text-[11px] leading-relaxed text-[var(--hw-brown)]">هذه المعاينة للإلهام؛ نناقش تفاصيل التصميم والمنتج معك حسب طلبك.</p>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-6 border-t border-[var(--hw-line)] pt-7 sm:mt-20 sm:grid-cols-3 sm:gap-10">
          {[
            { number: "01", title: "نسمع فكرتك", body: "أخبرنا عن الاسم، جمهورك، والتفاصيل التي تتخيّلها." },
            { number: "02", title: "نرسم هويّتك", body: "نناقش معك الألوان والتصميم والتغليف المناسب لعلامتك." },
            { number: "03", title: "من التصميم إلى المنتج", body: "نحوّل التفاصيل المتفق عليها إلى منتج جاهز يحمل اسم علامتك وبصمتها." },
          ].map((step) => (
            <div key={step.number} className="flex gap-4">
              <span dir="ltr" className="pt-1 font-display text-sm text-[var(--hw-brown)]">{step.number}</span>
              <div><h3 className="text-base font-medium">{step.title}</h3><p className="mt-2 text-xs leading-[1.9] text-[var(--hw-brown-deep)]/75">{step.body}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
