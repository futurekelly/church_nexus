"use client";

import { motion } from "framer-motion";
import { Settings, MapPin, Globe, CreditCard, Shield, Info, Lock } from "lucide-react";
import Link from "next/link";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { useBranches } from "@/features/settings/hooks/use-branches";
import { usePaymentAccounts } from "@/features/settings/hooks/use-payment-accounts";
import { useLocalizationSettings } from "@/features/settings/hooks/use-localization-settings";
import { useChurchProfile } from "@/features/settings/hooks/use-church-profile";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export default function SettingsDashboardPage() {
  const { t } = useTranslation();
  const { settings: permissions } = useAppPermissions();
  const { branches } = useBranches();
  const { accounts } = usePaymentAccounts();
  const { settings: localization } = useLocalizationSettings();
  const { profile } = useChurchProfile();

  if (!permissions.canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 select-none">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <Lock className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground font-display">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have the required permissions to view the system settings panel.
          </p>
        </div>
      </div>
    );
  }

  const activeBranchCount = branches.filter((b) => b.status === "Active").length;
  const activePaymentsCount = accounts.filter((a) => a.status === "Active").length;
  const hqBranchName = branches.find((b) => b.branch_type === "Headquarters")?.branch_name || "None Set";
  const defaultPaymentName = accounts.find((a) => a.is_default)?.account_name || "None Set";

  const cards = [
    {
      title: t("settings.branch_management"),
      desc: t("settings.branch_management_desc"),
      href: "/dashboard/settings/branches",
      icon: MapPin,
      show: permissions.canManageBranches || permissions.canViewBranches,
      badge: `${activeBranchCount} Active`,
      color: "border-blue-500/20 bg-blue-500/5 text-blue-400"
    },
    {
      title: t("settings.localization_formats"),
      desc: t("settings.localization_formats_desc"),
      href: "/dashboard/settings/localization",
      icon: Globe,
      show: permissions.canManageLocalization,
      badge: `${localization.default_language.toUpperCase()} / ${localization.default_currency}`,
      color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
    },
    {
      title: t("settings.payments_merchant"),
      desc: t("settings.payments_merchant_desc"),
      href: "/dashboard/settings/payments",
      icon: CreditCard,
      show: permissions.canManagePayments,
      badge: `${activePaymentsCount} Accounts`,
      color: "border-amber-500/20 bg-amber-500/5 text-amber-400"
    },
    {
      title: t("settings.church_identity"),
      desc: t("settings.church_identity_desc"),
      href: "/dashboard/settings/church-profile",
      icon: Info,
      show: permissions.canManageIdentity,
      badge: profile.church_name,
      color: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400"
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/30 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display">{t("settings.title")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("settings.subtitle")}
          </p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Church Name", value: profile.church_name, icon: Info, color: "text-indigo-400" },
          { label: "Headquarters Branch", value: hqBranchName, icon: MapPin, color: "text-blue-400" },
          { label: "System Currency", value: `${localization.default_currency} (${localization.default_language.toUpperCase()})`, icon: Globe, color: "text-emerald-400" },
          { label: "Default Donation Account", value: defaultPaymentName, icon: CreditCard, color: "text-amber-400" }
        ].map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-border/40 bg-card/40 p-5 backdrop-blur-glass shadow-glass flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</span>
              <p className="text-sm font-bold text-primary-foreground truncate max-w-[180px]">{item.value}</p>
            </div>
            <item.icon className={cn("h-5 w-5 opacity-40 shrink-0", item.color)} />
          </div>
        ))}
      </div>

      {/* Submodule Quick Links Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <Shield className="h-4 w-4 text-indigo-400" />
          <span>Configuration Submodules</span>
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {cards
            .filter((c) => c.show)
            .map((card) => (
              <motion.div
                key={card.href}
                whileHover={{ y: -2 }}
                className="flex flex-col justify-between rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-glass shadow-glass transition-all hover:border-indigo-500/20"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", card.color)}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-lg bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-primary-foreground leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-6 border-t border-border/30 pt-4 flex justify-end">
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>Configure Submodule</span>
                    <span>→</span>
                  </Link>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
