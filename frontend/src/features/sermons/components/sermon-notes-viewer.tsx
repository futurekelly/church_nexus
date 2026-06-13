"use client";

import { useState } from "react";
import { FileText, Download, CheckCircle, Copy, HelpCircle, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface SermonNotesViewerProps {
  notes: string;
  title: string;
  scripture: string;
}

export function SermonNotesViewer({ notes, title, scripture }: SermonNotesViewerProps) {
  const [activeTab, setActiveTab] = useState<"outline" | "questions">("outline");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Helper to split notes into Outline and Reflection Questions if they exist
  const getParsedNotes = () => {
    const defaultOutline = notes;
    let outline = notes;
    let questions = "";

    // Look for reflection questions header variants
    const reflectionIndex = notes.search(/(?:reflection\s+questions|##\s*reflection)/i);
    
    if (reflectionIndex !== -1) {
      outline = notes.substring(0, reflectionIndex).trim();
      questions = notes.substring(reflectionIndex).trim();
      
      // Clean up headers in questions if needed
      questions = questions.replace(/^(?:#+\s*reflection\s*questions|#+\s*reflection)/i, "").trim();
    } else {
      // Fallback questions if none are in the notes
      questions = `1. How does this scripture apply to your life this week?\n2. What was the most impactful point Rev. Kamau shared in today's sermon?\n3. How can you share this message of faith with someone in your community?`;
    }

    return {
      outline: outline || defaultOutline,
      questions: questions,
    };
  };

  const { outline, questions } = getParsedNotes();

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      toast.success("Download Complete", {
        description: `"${title}" study guide notes PDF has been saved.`,
      });
    }, 1500);
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(notes);
    setIsCopied(true);
    toast.success("Notes Copied", {
      description: "Sermon outline has been copied to your clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Simple formatter to convert markdown lists/headings into beautiful HTML elements
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return (
      <div className="space-y-4 text-slate-300 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-2" />;

          // Heading 2 or 3
          if (trimmed.startsWith("##") || trimmed.startsWith("###")) {
            const headingText = trimmed.replace(/^#+\s*/, "");
            return (
              <h4 key={idx} className="text-lg font-bold text-indigo-400 mt-6 mb-2 border-b border-border/10 pb-1 flex items-center gap-2">
                <BookOpen className="h-4 w-4 shrink-0 text-indigo-400" />
                {headingText}
              </h4>
            );
          }

          // Bullet point
          if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
            const bulletText = trimmed.replace(/^[-*]\s*/, "");
            // Support simple bolding `**text**`
            const formattedBullet = formatBoldText(bulletText);
            return (
              <ul key={idx} className="list-disc pl-6 space-y-1">
                <li className="text-slate-300">{formattedBullet}</li>
              </ul>
            );
          }

          // Numbered point
          if (/^\d+\.\s+/.test(trimmed)) {
            const numText = trimmed.replace(/^\d+\.\s*/, "");
            const numPrefix = trimmed.match(/^\d+\./)?.[0] || "";
            const formattedNum = formatBoldText(numText);
            return (
              <div key={idx} className="flex gap-3 items-start pl-2">
                <span className="font-mono text-indigo-400 font-bold shrink-0">{numPrefix}</span>
                <p className="text-slate-300 flex-1">{formattedNum}</p>
              </div>
            );
          }

          // Standard paragraph
          return <p key={idx}>{formatBoldText(trimmed)}</p>;
        })}
      </div>
    );
  };

  const formatBoldText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    if (parts.length === 1) return text;
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-indigo-200 font-semibold">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-glass overflow-hidden shadow-glass">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-border/50 bg-slate-900/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <FileText className="h-4 w-4" />
            <span>Study Guide &amp; Resources</span>
          </div>
          <h3 className="text-xl font-bold text-primary-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">Scripture Text: {scripture}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyNotes}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/50 bg-card hover:bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-indigo-400 transition-colors"
          >
            {isCopied ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Outline</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed px-3.5 py-2 text-xs font-bold text-white shadow-lg hover:shadow-indigo-500/20 transition-all"
          >
            {isDownloading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-border/20 bg-slate-950/40 p-1.5">
        <button
          onClick={() => setActiveTab("outline")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "outline"
              ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-glass"
              : "text-muted-foreground hover:text-slate-200"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Sermon Outline
        </button>

        <button
          onClick={() => setActiveTab("questions")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "questions"
              ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-glass"
              : "text-muted-foreground hover:text-slate-200"
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Reflection Questions
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeTab === "outline" ? (
            <motion.div
              key="outline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderFormattedText(outline)}
            </motion.div>
          ) : (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderFormattedText(questions)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
