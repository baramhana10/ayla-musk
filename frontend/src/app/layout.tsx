import type { Metadata } from "next";
import { Playfair_Display, Manrope, Amiri, Tajawal } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";
import { INTRO_ARM_SCRIPT } from "@/components/home/IntroVeil";
import LocaleSync from "@/components/layout/LocaleSync";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aylamusk.example.com"),
  title: {
    default: "أيلا مَسك — عطور فاخرة ومسك وضباب الجسم",
    template: "%s — أيلا مَسك",
  },
  description:
    "تصنع أيلا مَسك زيوت مسك عصرية وزبدات جسم وأطقم هدايا متجذّرة في فن المسك الخالد. اكتشفي عطرك المميز.",
  keywords: ["عطور", "مسك", "زيت عطري", "زبدة الجسم", "عطور فاخرة", "perfume", "musk"],
  openGraph: {
    title: "أيلا مَسك — عطور فاخرة ومسك وضباب الجسم",
    description: "عطور عصرية، متجذّرة في فن المسك الخالد.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#17110f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${playfair.variable} ${manrope.variable} ${amiri.variable} ${tajawal.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body antialiased" suppressHydrationWarning>
        {/* App Router's supported home for scripts that must run before hydration. */}
        <Script id="ayla-intro-arm" strategy="beforeInteractive">
          {INTRO_ARM_SCRIPT}
        </Script>
        <LocaleSync />
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#2b211f",
              color: "#fdf9f6",
              border: "none",
              borderRadius: "999px",
              fontSize: "13px",
              padding: "10px 18px",
            },
          }}
        />
      </body>
    </html>
  );
}
