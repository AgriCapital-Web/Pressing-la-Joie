import { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Heading2, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon } from "lucide-react";

interface WYSIWYGEditorProps {
  value?: string;
  content?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

/**
 * Lightweight Markdown editor with a small toolbar.
 */
const WYSIWYGEditor = ({ value, content, onChange, placeholder, rows = 14 }: WYSIWYGEditorProps) => {
  const text = value ?? content ?? "";
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrap = (before: string, after = before) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, end + before.length);
    });
  };

  const insertLine = (prefix: string) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
        <Button type="button" size="sm" variant="ghost" onClick={() => wrap("**")} title="Gras"><Bold className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => wrap("*")} title="Italique"><Italic className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => insertLine("## ")} title="Titre"><Heading2 className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => insertLine("- ")} title="Liste"><List className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => insertLine("1. ")} title="Liste numérotée"><ListOrdered className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => insertLine("> ")} title="Citation"><Quote className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => wrap("[", "](https://)")} title="Lien"><LinkIcon className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => wrap("![alt](", ")")} title="Image"><ImageIcon className="w-4 h-4" /></Button>
      </div>
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Écrivez votre contenu en Markdown…"}
        rows={rows}
        className="border-0 rounded-none resize-y font-mono text-sm"
      />
    </div>
  );
};

export default WYSIWYGEditor;
