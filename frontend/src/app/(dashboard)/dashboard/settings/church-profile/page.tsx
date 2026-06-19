"use client";

import { Info, ArrowLeft, Check, Lock } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { useChurchProfile } from "@/features/settings/hooks/use-church-profile";
import type { ChurchProfileSettings } from "@/features/settings";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs",
  "text-primary-foreground placeholder:text-muted-foreground/50 focus:border-indigo-500/50 focus:outline-none"
);

const labelClass = "block text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider";

export default function ChurchProfileSettingsPage() {
  const { settings: permissions } = useAppPermissions();
  const { profile, updateChurchProfile } = useChurchProfile();

  const { register, handleSubmit } = useForm<ChurchProfileSettings>({
    defaultValues: {
      church_name: profile.church_name,
      slogan: profile.slogan || "",
      logo_url: profile.logo_url,
      favicon_url: profile.favicon_url || "",
      website: profile.website,
      email: profile.email,
      phone: profile.phone,
      social_media: {
        facebook: profile.social_media.facebook || "",
        youtube: profile.social_media.youtube || "",
        instagram: profile.social_media.instagram || "",
        twitter: profile.social_media.twitter || ""
      },
      headquarters_branch_id: profile.headquarters_branch_id
    }
  });

  // Guard: Only Super Admin and Church Admin can manage church profile settings
  if (!permissions.canManageIdentity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 select-none">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <Lock className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground font-display">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have the required permissions to edit the global church identity profile.
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = (data: ChurchProfileSettings) => {
    updateChurchProfile(data);
  };

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
            <Info className="h-6 w-6 text-indigo-400" />
            Church Identity Profile
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure default names, branding slogans, logos, support emails, and social media channels.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-glass shadow-glass">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Identity details */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="church_name" className={labelClass}>Church Name *</label>
              <input
                id="church_name"
                type="text"
                placeholder="e.g. Church Nexus"
                className={inputClass}
                required
                {...register("church_name")}
              />
            </div>
            <div>
              <label htmlFor="slogan" className={labelClass}>Branding Slogan</label>
              <input
                id="slogan"
                type="text"
                placeholder="e.g. Uniting the Body of Christ"
                className={inputClass}
                {...register("slogan")}
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="logo_url" className={labelClass}>Logo URL *</label>
              <input
                id="logo_url"
                type="text"
                placeholder="https://..."
                className={inputClass}
                required
                {...register("logo_url")}
              />
            </div>
            <div>
              <label htmlFor="favicon_url" className={labelClass}>Favicon URL</label>
              <input
                id="favicon_url"
                type="text"
                placeholder="/favicon.ico"
                className={inputClass}
                {...register("favicon_url")}
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label htmlFor="website" className={labelClass}>Official Website *</label>
              <input
                id="website"
                type="text"
                placeholder="https://church-nexus.org"
                className={inputClass}
                required
                {...register("website")}
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Support Email *</label>
              <input
                id="email"
                type="email"
                placeholder="info@church-nexus.org"
                className={inputClass}
                required
                {...register("email")}
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Official Phone *</label>
              <input
                id="phone"
                type="text"
                placeholder="+255754000000"
                className={inputClass}
                required
                {...register("phone")}
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="border-t border-border/30 pt-4">
            <h3 className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-3">Social Media Coordinates</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="social_facebook" className={labelClass}>Facebook URL</label>
                <input
                  id="social_facebook"
                  type="text"
                  placeholder="https://facebook.com/..."
                  className={inputClass}
                  {...register("social_media.facebook")}
                />
              </div>
              <div>
                <label htmlFor="social_youtube" className={labelClass}>YouTube URL</label>
                <input
                  id="social_youtube"
                  type="text"
                  placeholder="https://youtube.com/..."
                  className={inputClass}
                  {...register("social_media.youtube")}
                />
              </div>
              <div>
                <label htmlFor="social_instagram" className={labelClass}>Instagram URL</label>
                <input
                  id="social_instagram"
                  type="text"
                  placeholder="https://instagram.com/..."
                  className={inputClass}
                  {...register("social_media.instagram")}
                />
              </div>
              <div>
                <label htmlFor="social_twitter" className={labelClass}>Twitter / X URL</label>
                <input
                  id="social_twitter"
                  type="text"
                  placeholder="https://twitter.com/..."
                  className={inputClass}
                  {...register("social_media.twitter")}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/30">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-indigo-600 shadow-neon"
            >
              <Check className="h-4 w-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
