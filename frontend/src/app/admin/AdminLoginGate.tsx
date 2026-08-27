"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuthStore, DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from "@/store/adminAuth";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useT } from "@/store/locale";

export default function AdminLoginGate({ children }: { children: ReactNode }) {
  const t = useT();
  const isAdmin = useAdminAuthStore((s) => s.isAdmin);
  const hydrated = useAdminAuthStore((s) => s.hydrated);
  const refresh = useAdminAuthStore((s) => s.refresh);
  const login = useAdminAuthStore((s) => s.login);
  const [email, setEmail] = useState(DEMO_ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hydrated) return <div className="min-h-screen bg-ivory" />;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blush-soft/50 px-6">
        <div className="w-full max-w-sm rounded-2xl bg-ivory p-8 shadow-lg">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-deep-rose/10">
            <Lock size={18} className="text-deep-rose" />
          </div>
          <h1 className="mt-4 text-center font-display text-2xl text-charcoal">{t("admin.consoleTitle")}</h1>
          <p className="mt-1 text-center text-xs text-charcoal/50">{t("admin.consoleSubtitle")}</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              const ok = await login(email, password);
              setSubmitting(false);
              if (ok) toast.success(t("admin.welcomeBack"));
              else toast.error(t("admin.invalidCreds"));
            }}
          >
            <Input label={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label={t("auth.password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? t("admin.signingIn") : t("admin.signIn")}
            </Button>
          </form>
          <p className="mt-5 rounded-lg bg-blush-soft/70 p-3 text-center text-[11px] text-charcoal/50">
            {t("admin.demoCreds")} — {DEMO_ADMIN_EMAIL} / {DEMO_ADMIN_PASSWORD}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
