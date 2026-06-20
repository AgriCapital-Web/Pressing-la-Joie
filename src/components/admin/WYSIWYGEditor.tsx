import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Palette,
  Redo2,
  Table,
  Underline,
  Undo2,
  Video,
} from "lucide-react";

interface WYSIWYGEditorProps {
  value?: string;
  content?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const WYSIWYGEditor = ({ value, content, onChange, placeholder, rows = 14 }: WYSIWYGEditorProps) => {
  const html = value ?? content ?? "";
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [color, setColor] = useState("#1A5C38");

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor || editor.innerHTML === html) return;
    editor.innerHTML = html;
  }, [html]);

  const emit = () => onChange(editorRef.current?.innerHTML || "");
  const focus = () => editorRef.current?.focus();
  const run = (command: string, argument?: string) => {
    focus();
    document.execCommand(command, false, argument);
    emit();
  };

  const insertLink = () => {
    const url = window.prompt("Lien à insérer", "https://");
    if (url) run("createLink", url);
  };

  const insertButton = () => {
    const label = window.prompt("Texte du bouton", "Nous contacter") || "Nous contacter";
    const url = window.prompt("Lien du bouton", "https://www.agricapital.ci/contact") || "https://www.agricapital.ci/contact";
    run("insertHTML", `<p style="text-align:center;margin:24px 0;"><a href="${url}" style="display:inline-block;background:#1A5C38;color:#ffffff;padding:13px 26px;border-radius:8px;text-decoration:none;font-weight:700;">${label}</a></p>`);
  };

  const insertTable = () => {
    run("insertHTML", `<table style="width:100%;border-collapse:collapse;margin:16px 0;"><tr><td style="border:1px solid #d9ded8;padding:10px;">Colonne 1</td><td style="border:1px solid #d9ded8;padding:10px;">Colonne 2</td></tr><tr><td style="border:1px solid #d9ded8;padding:10px;">Texte</td><td style="border:1px solid #d9ded8;padding:10px;">Texte</td></tr></table>`);
  };

  const insertVideo = () => {
    const url = window.prompt("URL de la vidéo", "https://");
    if (!url) return;
    run("insertHTML", `<p style="margin:18px 0;"><a href="${url}" style="color:#1A5C38;font-weight:700;text-decoration:underline;">▶ Voir la vidéo</a></p>`);
  };

  const handleImageFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => run("insertImage", String(reader.result));
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div className="border rounded-md overflow-hidden bg-card">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
        <Button type="button" size="sm" variant="ghost" onClick={() => run("bold")} title="Gras"><Bold className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => run("italic")} title="Italique"><Italic className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => run("underline")} title="Souligné"><Underline className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => run("insertUnorderedList")} title="Liste"><List className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => run("insertOrderedList")} title="Liste numérotée"><ListOrdered className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => run("justifyLeft")} title="Aligner à gauche"><AlignLeft className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => run("justifyCenter")} title="Centrer"><AlignCenter className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => run("justifyRight")} title="Aligner à droite"><AlignRight className="w-4 h-4" /></Button>
        <label className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm hover:bg-muted cursor-pointer" title="Couleur">
          <Palette className="w-4 h-4" />
          <input type="color" value={color} onChange={(e) => { setColor(e.target.value); run("foreColor", e.target.value); }} className="h-5 w-6 bg-transparent" />
        </label>
        <Button type="button" size="sm" variant="ghost" onClick={insertLink} title="Lien"><LinkIcon className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => fileRef.current?.click()} title="Image"><ImageIcon className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={insertVideo} title="Vidéo"><Video className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={insertTable} title="Tableau"><Table className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={insertButton} title="Bouton CTA">CTA</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => run("undo")} title="Annuler"><Undo2 className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => run("redo")} title="Rétablir"><Redo2 className="w-4 h-4" /></Button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        className="prose prose-sm dark:prose-invert max-w-none min-h-[280px] overflow-auto bg-background px-5 py-4 text-foreground focus:outline-none"
        style={{ minHeight: `${rows * 24}px` }}
        data-placeholder={placeholder ?? "Rédigez et mettez en forme votre email…"}
      />
    </div>
  );
};

export default WYSIWYGEditor;
