"use client";

import { useMemo } from "react";
import { Globe, ArrowLeft, Check, Lock } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { useLocalizationSettings } from "@/features/settings/hooks/use-localization-settings";
import type { LocalizationSettings, SupportedLanguage, SupportedCurrency, SupportedCountry } from "@/features/settings";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs",
  "text-primary-foreground placeholder:text-muted-foreground/50 focus:border-indigo-500/50 focus:outline-none"
);

const labelClass = "block text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider";

export default function LocalizationSettingsPage() {
  const { t } = useTranslation();
  const { settings: permissions } = useAppPermissions();
  const { settings, updateLocalizationSettings } = useLocalizationSettings();

  const { register, handleSubmit, watch } = useForm<LocalizationSettings>({
    defaultValues: {
      default_language: settings.default_language,
      default_currency: settings.default_currency,
      default_country: settings.default_country,
      timezone: settings.timezone,
    }
  });

  const watchLanguage = watch("default_language");
  const watchCurrency = watch("default_currency");
  const watchCountry = watch("default_country");
  const watchTimezone = watch("timezone");

  // Guard: Only Super Admin and Church Admin can manage localization
  if (!permissions.canManageLocalization) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 select-none">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <Lock className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground font-display">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have the required permissions to manage localization and formats settings.
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = (data: LocalizationSettings) => {
    updateLocalizationSettings(data);
  };

  // Previews based on current form status
  const previews = useMemo(() => {
    const localeStr = watchLanguage === "sw" ? "sw-TZ" : "en-US";
    const formattedCurrency = new Intl.NumberFormat(localeStr, {
      style: "currency",
      currency: watchCurrency,
    }).format(1250000);

    const formattedDate = new Intl.DateTimeFormat(localeStr, {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date());

    const formattedNumber = new Intl.NumberFormat(localeStr).format(45200);

    return {
      currency: formattedCurrency,
      date: formattedDate,
      number: formattedNumber,
    };
  }, [watchLanguage, watchCurrency]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/30 pb-4">
        <Link
          href="/dashboard/settings"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 transition-colors text-muted-foreground hover:text-primary-foreground"
          aria-label="Back to settings"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <Globe className="h-6 w-6 text-indigo-400" />
            {t("settings.localization.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("settings.localization.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Form panel */}
        <div className="md:col-span-2 rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-glass shadow-glass">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Language */}
              <div>
                <label htmlFor="default_language" className={labelClass}>{t("settings.localization.default_lang")}</label>
                <select id="default_language" className={inputClass} {...register("default_language")}>
                  <option value="sw">Kiswahili (Swahili)</option>
                  <option value="en">English (United States)</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="default_currency" className={labelClass}>{t("settings.localization.system_currency")}</label>
                <select id="default_currency" className={inputClass} {...register("default_currency")}>
                  <option value="TZS">TZS - Tanzanian Shilling (TSh)</option>
                  <option value="KES">KES - Kenyan Shilling (KSh)</option>
                  <option value="UGX">UGX - Ugandan Shilling (USh)</option>
                  <option value="RWF">RWF - Rwandan Franc (FRw)</option>
                  <option value="USD">USD - United States Dollar ($)</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Country */}
              <div>
                <label htmlFor="default_country" className={labelClass}>{t("settings.localization.default_country")}</label>
                <select id="default_country" className={inputClass} {...register("default_country")}>
                  <option value="TZ">Tanzania (TZ)</option>
                  <option value="KE">Kenya (KE)</option>
                  <option value="UG">Uganda (UG)</option>
                  <option value="RW">Rwanda (RW)</option>
                  <option value="US">United States (US)</option>
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label htmlFor="timezone" className={labelClass}>{t("settings.localization.timezone")}</label>
                <select id="timezone" className={inputClass} {...register("timezone")}>
                  <option value="Africa/Dar_es_Salaam">Africa/Dar es Salaam (EAT - UTC+3)</option>
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT - UTC+3)</option>
                  <option value="Africa/Kigali">Africa/Kigali (CAT - UTC+2)</option>
                  <option value="Africa/Kampala">Africa/Kampala (EAT - UTC+3)</option>
                  <option value="UTC">UTC / GMT (UTC+0)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/30">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-indigo-600 shadow-neon"
              >
                <Check className="h-4 w-4" />
                <span>{t("settings.localization.save_btn")}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Panel */}
        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent p-6 backdrop-blur-glass shadow-[0_0_12px_rgba(99,102,241,0.05)] space-y-6">
          <div>
            <h3 className="font-display text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Localization Preview</h3>
            <p className="text-[11px] text-muted-foreground">Live display format previews based on select parameters.</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Currency Format */}
            <div className="rounded-xl border border-border/30 bg-slate-900/40 p-3 space-y-1">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase">Currency formatting</span>
              <p className="font-mono text-sm font-bold text-primary-foreground">{previews.currency}</p>
            </div>

            {/* Date/Time Format */}
            <div className="rounded-xl border border-border/30 bg-slate-900/40 p-3 space-y-1">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase">Date & time formatting</span>
              <p className="text-xs font-semibold text-primary-foreground leading-relaxed">{previews.date}</p>
            </div>

            {/* Number Format */}
            <div className="rounded-xl border border-border/30 bg-slate-900/40 p-3 space-y-1">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase">Congregation numbers count</span>
              <p className="font-mono text-sm font-bold text-primary-foreground">{previews.number} members</p>
            </div>

            {/* Active profile review */}
            <div className="text-[10px] text-muted-foreground leading-relaxed pt-2">
              <div className="flex justify-between border-b border-border/20 py-1">
                <span>Active Language:</span>
                <span className="font-mono text-slate-300">{watchLanguage === "sw" ? "Swahili (sw)" : "English (en)"}</span>
              </div>
              <div className="flex justify-between border-b border-border/20 py-1">
                <span>Country Code:</span>
                <span className="font-mono text-slate-300">{watchCountry}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Selected Timezone:</span>
                <span className="font-mono text-slate-300 text-right truncate max-w-[120px]">{watchTimezone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
