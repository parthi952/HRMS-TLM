import { useState, useRef, useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { LinkNode } from "@lexical/link";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { 
  $getSelection, 
  $isRangeSelection, 
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND
} from "lexical";
import { INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { 
  $convertFromMarkdownString, 
  $convertToMarkdownString, 
  TRANSFORMERS 
} from "@lexical/markdown";
import { 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  AlertCircle,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Undo,
  Redo,
  List,
  Minus
} from "lucide-react";
import toast from "react-hot-toast";

type TextEditorProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  warningLength?: number;
  warningMessage?: string;
  showCopy?: boolean;
  showDownload?: boolean;
  showClear?: boolean;
  downloadFileName?: string;
  className?: string;
  fontFamily?: "sans" | "mono";
  keywords?: string[];
};

// High-fidelity custom lightweight markdown compiler for static rendering in preview tabs
export const renderMarkdown = (text: string): string => {
  if (!text) return "<p class='text-slate-400/80 italic text-xs select-none'>Start typing to see live visual preview...</p>";
  
  let html = text;

  // Escape HTML entities to prevent XSS but keep rendering safe
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-slate-900'>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong class='font-bold text-slate-900'>$1</strong>");

  // Italic (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, "<em class='italic text-slate-800'>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em class='italic text-slate-800'>$1</em>");

  // Strikethrough (~~text~~)
  html = html.replace(/~~(.*?)~~/g, "<span class='line-through text-slate-500/80'>$1</span>");

  // Horizontal line (---)
  html = html.replace(/\n---\n/g, "<hr class='my-4 border-slate-200' />");

  // Headers (# Header)
  html = html.replace(/^# (.*?)$/gm, "<h1 class='text-lg font-black text-slate-900 mb-2 mt-3 pb-1 border-b border-slate-100'>$1</h1>");
  html = html.replace(/^## (.*?)$/gm, "<h2 class='text-base font-bold text-slate-900 mb-1.5 mt-2.5'>$1</h2>");
  html = html.replace(/^### (.*?)$/gm, "<h3 class='text-sm font-bold text-slate-900 mb-1 mt-2'>$1</h3>");

  // Links [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-primary hover:underline font-semibold'>$1 ↗</a>");

  // Process list bullets (lines starting with "- " or "* ")
  html = html.split("\n").map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      return `<li class="list-disc ml-5 mb-1 text-slate-700 font-sans">${trimmed.substring(2)}</li>`;
    }
    if (trimmed.startsWith("* ")) {
      return `<li class="list-disc ml-5 mb-1 text-slate-700 font-sans">${trimmed.substring(2)}</li>`;
    }
    return line;
  }).join("\n");

  return html;
};

// Safe locks and state transformer for Lexical <=> Markdown state synchronization
function MarkdownSyncPlugin({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (val: string) => void; 
}) {
  const [editor] = useLexicalComposerContext();
  const isUpdatingRef = useRef(false);

  // Sync parent values (like AI post generation) into Lexical Nodes
  useEffect(() => {
    if (isUpdatingRef.current) return;
    
    editor.update(() => {
      const currentMarkdown = $convertToMarkdownString(TRANSFORMERS);
      if (currentMarkdown.trim() !== value.trim()) {
        isUpdatingRef.current = true;
        $convertFromMarkdownString(value, TRANSFORMERS);
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 50);
      }
    });
  }, [value, editor]);

  // Sync internal edits up to parent as Markdown string
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      if (isUpdatingRef.current) return;

      editorState.read(() => {
        const markdown = $convertToMarkdownString(TRANSFORMERS);
        if (markdown.trim() !== value.trim()) {
          isUpdatingRef.current = true;
          onChange(markdown);
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 50);
        }
      });
    });
  }, [editor, onChange, value]);

  return null;
}

// Inner Component to safely consume useLexicalComposerContext
const TextEditorInner = ({
  label,
  value,
  onChange,
  placeholder = "Type your content here...",
  maxLength,
  warningLength,
  warningMessage = "Character limit exceeded for optimized social posting.",
  showCopy = true,
  showDownload = true,
  showClear = true,
  downloadFileName = "document.txt",
  className = "",
  fontFamily = "sans",
  keywords = [],
}: TextEditorProps) => {
  const [copied, setCopied] = useState(false);
  const [editor] = useLexicalComposerContext();

  // Copy to clipboard helper
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Text copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy text.");
    }
  };

  // Download text file helper
  const handleDownload = () => {
    try {
      const element = document.createElement("a");
      const file = new Blob([value], { type: "text/plain;charset=utf-8" });
      element.href = URL.createObjectURL(file);
      element.download = downloadFileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("File downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download file.");
    }
  };

  // Clear text helper
  const handleClear = () => {
    editor.update(() => {
      $convertFromMarkdownString("", TRANSFORMERS);
    });
    onChange("");
    toast.success("Editor cleared!");
  };

  // Command-based rich visual formatting helpers
  const applyFormat = (type: "bold" | "italic" | "underline" | "strikethrough" | "bullet" | "line" | "undo" | "redo") => {
    editor.focus();
    if (type === "bold") {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
    } else if (type === "italic") {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
    } else if (type === "underline") {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
    } else if (type === "strikethrough") {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
    } else if (type === "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else if (type === "undo") {
      editor.dispatchCommand(UNDO_COMMAND, undefined);
    } else if (type === "redo") {
      editor.dispatchCommand(REDO_COMMAND, undefined);
    } else if (type === "line") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText("\n---\n");
        }
      });
    }
  };

  const isWarningActive = warningLength && value.length > warningLength;

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {/* Label and Actions Header */}
      {(label || showCopy || showDownload || showClear) && (
        <div className="flex items-center justify-between min-h-[36px] flex-wrap gap-2">
          {label && (
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
              {label}
            </label>
          )}

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-1.5 ml-auto">
            {showClear && value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 rounded-lg border border-slate-100 bg-white hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 text-slate-400 transition-all shadow-sm"
                title="Clear Content"
              >
                <Trash2 size={13} />
              </button>
            )}
            
            {showDownload && value && (
              <button
                type="button"
                onClick={handleDownload}
                className="p-2 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 text-slate-500 hover:text-primary transition-all shadow-sm"
                title="Download Draft Text (.txt)"
              >
                <Download size={13} />
              </button>
            )}

            {showCopy && value && (
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-lg border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 hover:text-primary transition-all shadow-sm flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
              >
                {copied ? (
                  <Check size={13} className="text-emerald-500" />
                ) : (
                  <Copy size={13} />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Rich Formatting & History Toolbar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-100/80 rounded-xl shadow-sm flex-wrap">
        {/* History actions */}
        <button
          type="button"
          onClick={() => applyFormat("undo")}
          className="p-2 hover:bg-white hover:shadow-sm text-slate-600 rounded-lg transition-all flex items-center justify-center"
          title="Undo (Ctrl+Z)"
        >
          <Undo size={13} />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("redo")}
          className="p-2 hover:bg-white hover:shadow-sm text-slate-600 rounded-lg transition-all flex items-center justify-center"
          title="Redo (Ctrl+Y)"
        >
          <Redo size={13} />
        </button>
        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

        {/* Text styling */}
        <button
          type="button"
          onClick={() => applyFormat("bold")}
          className="p-2 hover:bg-white hover:shadow-sm text-slate-600 rounded-lg transition-all flex items-center justify-center font-bold"
          title="Bold (Ctrl+B)"
        >
          <Bold size={13} className="stroke-[2.5px]" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("italic")}
          className="p-2 hover:bg-white hover:shadow-sm text-slate-600 rounded-lg transition-all flex items-center justify-center italic"
          title="Italic (Ctrl+I)"
        >
          <Italic size={13} className="stroke-[2.5px]" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("underline")}
          className="p-2 hover:bg-white hover:shadow-sm text-slate-600 rounded-lg transition-all flex items-center justify-center underline"
          title="Underline (Ctrl+U)"
        >
          <Underline size={13} className="stroke-[2.5px]" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("strikethrough")}
          className="p-2 hover:bg-white hover:shadow-sm text-slate-600 rounded-lg transition-all flex items-center justify-center line-through"
          title="Strikethrough"
        >
          <Strikethrough size={13} className="stroke-[2.5px]" />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

        {/* Blocks */}
        <button
          type="button"
          onClick={() => applyFormat("bullet")}
          className="p-2 hover:bg-white hover:shadow-sm text-slate-600 rounded-lg transition-all flex items-center justify-center"
          title="Bullet List"
        >
          <List size={13} />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("line")}
          className="p-2 hover:bg-white hover:shadow-sm text-slate-600 rounded-lg transition-all flex items-center justify-center"
          title="Divider Line"
        >
          <Minus size={13} />
        </button>
      </div>

      {/* Lexical Visual WYSIWYG Workspace Container */}
      <div className="relative w-full">
        <RichTextPlugin
          contentEditable={
            <ContentEditable 
              className={`w-full p-5 rounded-2xl border transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/50 min-h-[320px] max-h-[550px] overflow-y-auto outline-none
                ${fontFamily === "mono" ? "font-mono" : "font-sans"}
                ${
                  isWarningActive
                    ? "border-amber-200 bg-amber-50/5 text-slate-700"
                    : "border-slate-100 bg-white text-slate-700"
                }
              `} 
            />
          }
          placeholder={
            <div className="absolute top-5 left-5 text-slate-400 text-sm leading-relaxed pointer-events-none select-none">
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <MarkdownSyncPlugin value={value} onChange={onChange} />

        {/* Counter Overlay */}
        <div className="absolute right-4 bottom-4 text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 select-none z-10">
          {value.length}
          {maxLength ? ` / ${maxLength}` : ""} Characters
        </div>
      </div>

      {/* Keywords Badge Section */}
      {keywords && keywords.length > 0 && (
        <div className="flex flex-col gap-2 p-4 bg-slate-50/40 backdrop-blur-md rounded-2xl border border-slate-100/60 shadow-sm mt-0.5">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            ATS Keywords & Skills (Click to insert as hashtag)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((kw, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-[10px] font-extrabold bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 rounded-lg hover:scale-105 hover:shadow-sm transition-all duration-200 select-none cursor-pointer"
                onClick={() => {
                  editor.focus();
                  editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                      selection.insertText(` #${kw.replace(/\s+/g, "")} `);
                      toast.success(`Inserted tag #${kw.replace(/\s+/g, "")}!`);
                    }
                  });
                }}
                title="Click to insert as hashtag at cursor"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Warn alerts */}
      {isWarningActive && (
        <div className="flex items-start gap-2 p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-[11px] font-bold leading-normal animate-fade-in shadow-sm">
          <AlertCircle size={15} className="shrink-0 text-amber-600 mt-0.5" />
          <span>{warningMessage} (Length: {value.length} characters)</span>
        </div>
      )}
    </div>
  );
};

// Root Composer Wrapper for Lexical State Management
export const TextEditor = (props: TextEditorProps) => {
  const initialConfig = {
    namespace: "SocialRichEditor",
    theme: {
      paragraph: "mb-2 text-slate-700 leading-relaxed font-sans text-sm",
      text: {
        bold: "font-black text-slate-900",
        italic: "italic text-slate-800",
        underline: "underline",
        strikethrough: "line-through text-slate-500/80",
      },
      list: {
        ul: "list-disc ml-5 mb-2 text-slate-700 font-sans text-sm",
        listitem: "mb-1 text-slate-700",
      }
    },
    nodes: [ListNode, ListItemNode, HeadingNode, QuoteNode, LinkNode, CodeNode, CodeHighlightNode],
    onError: (error: Error) => {
      console.error("Lexical Editor Error:", error);
    }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <TextEditorInner {...props} />
    </LexicalComposer>
  );
};
