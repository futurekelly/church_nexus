"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Heart, 
  Share2, 
  Copy, 
  Sparkles, 
  Clock, 
  RefreshCw,
  Check
} from "lucide-react";
import { apiGet } from "@/services/api-client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ScriptureData {
  verse: string;
  reference: string;
  reflection: string;
}

const FALLBACK_BIBLE_VERSES = [
  {
    verse: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    reference: "Proverbs 3:5-6",
    reflection: "Trusting God means letting go of our own need to control outcomes and relying on His infinite wisdom."
  },
  {
    verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
    reference: "Jeremiah 29:11",
    reflection: "God's intentions for us are always focused on our ultimate spiritual growth and future hope."
  },
  {
    verse: "I can do all this through him who gives me strength.",
    reference: "Philippians 4:13",
    reflection: "Our capacity to endure and thrive comes directly from the strength provided by Christ."
  },
  {
    verse: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
    reference: "Psalm 23:1-3",
    reflection: "Recognizing God as our shepherd and provider gives us peace, rest, and complete contentment."
  },
  {
    verse: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.",
    reference: "Galatians 5:22-23",
    reflection: "A life aligned with the Holy Spirit naturally produces virtues that bless others and honor God."
  }
];

export default function ScriptureDashboardPage() {
  const [scripture, setScripture] = useState<ScriptureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  async function fetchScripture() {
    setLoading(true);
    try {
      const response = await apiGet<any>("/api/sermons/scripture/daily/");
      if (response.success && response.data) {
        setScripture({
          verse: response.data.verse,
          reference: response.data.reference,
          reflection: response.data.reflection,
        });
      } else {
        // Fallback to local daily verse
        const dayOfYear = new Date().getDate();
        const fallback = FALLBACK_BIBLE_VERSES[dayOfYear % FALLBACK_BIBLE_VERSES.length];
        setScripture(fallback);
      }
    } catch (err) {
      console.error(err);
      const fallback = FALLBACK_BIBLE_VERSES[0];
      setScripture(fallback);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchScripture();
  }, []);

  const handleCopy = () => {
    if (!scripture) return;
    const textToCopy = `"${scripture.verse}" — ${scripture.reference}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Scripture copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!scripture) return;
    if (navigator.share) {
      navigator.share({
        title: "Daily Scripture",
        text: `"${scripture.verse}" — ${scripture.reference}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      handleCopy();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-400" />
            Scripture Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reflect on today's word, build your faith, and explore daily scripture library insights.
          </p>
        </div>

        <button
          onClick={fetchScripture}
          disabled={loading}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/40 text-muted-foreground transition-all hover:bg-slate-900 hover:text-primary-foreground",
            loading && "animate-spin"
          )}
          aria-label="Refresh scripture"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border/40 bg-card/60 p-8 text-center animate-pulse min-h-[300px] flex flex-col justify-center items-center gap-4">
          <div className="h-4 w-48 rounded bg-border/40" />
          <div className="h-6 w-96 rounded bg-border/60" />
          <div className="h-4 w-80 rounded bg-border/40" />
        </div>
      ) : scripture ? (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Verse Card */}
          <div className="md:col-span-2 glass-panel rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent p-8 flex flex-col justify-between min-h-[320px] shadow-neon">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-6">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Verse of the Day</span>
              </div>
              <blockquote className="text-lg md:text-xl font-medium leading-relaxed text-primary-foreground italic">
                "{scripture.verse}"
              </blockquote>
              <cite className="block mt-4 text-xs font-bold text-indigo-400 not-italic uppercase tracking-wider">
                — {scripture.reference}
              </cite>
            </div>

            <div className="mt-8 pt-4 border-t border-border/20 flex gap-3">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary-foreground transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary-foreground transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Reflection Card */}
          <div className="glass-panel rounded-2xl border border-border/40 bg-card/40 p-6 flex flex-col justify-between shadow-glass">
            <div className="space-y-4">
              <h3 className="font-display text-sm font-bold text-primary-foreground flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-rose-400" />
                Daily Reflection
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {scripture.reflection}
              </p>
            </div>

            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 border-t border-border/20 pt-4 mt-6">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>Valid for today. Refreshes at midnight.</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Library/Timeline Section */}
      <div className="space-y-4 pt-4">
        <h2 className="font-display text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-emerald-400" />
          Weekly Devotion Archive
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FALLBACK_BIBLE_VERSES.map((v, idx) => (
            <div 
              key={idx} 
              className="glass-panel rounded-xl border border-border/40 p-5 bg-card/20 space-y-3 flex flex-col justify-between hover:border-indigo-500/20 transition-all"
            >
              <div>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "{v.verse}"
                </p>
                <span className="block mt-2 text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
                  {v.reference}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 border-t border-border/10 pt-2 leading-relaxed">
                {v.reflection}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
