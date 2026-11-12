import type { Metadata } from "next";
import UnsubscribeForm from "./UnsubscribeForm";

export const metadata: Metadata = { title: "إدارة الاشتراك", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <UnsubscribeForm token={typeof token === "string" ? token : ""} />;
}
