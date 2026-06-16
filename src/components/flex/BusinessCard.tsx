import { QRCodeSVG } from "qrcode.react";
import type { Profile } from "@/lib/mock/types";
import {
  Phone, Mail, Globe, MessageCircle, Linkedin, Instagram, Facebook, Twitter,
  Music2, Download, MapPin, QrCode, Share2, UserPlus, Send, Repeat,
} from "lucide-react";

type Props = {
  profile: Profile;
  variant?: "preview" | "full" | "print";
  publicUrl?: string;
};

function publicUrlFor(p: Profile, override?: string) {
  return override ?? `${typeof window !== "undefined" ? window.location.origin : "https://flexcard.app"}/c/${p.slug}`;
}

function initials(p: Profile) {
  return `${p.firstName?.[0] ?? "?"}${p.lastName?.[0] ?? ""}`.toUpperCase();
}

function coverBg(p: Profile) {
  if (p.coverUrl) return `url(${p.coverUrl}) center/cover no-repeat`;
  return `linear-gradient(135deg, ${p.palette.primary}, ${p.palette.accent})`;
}

/* ----------------------------- Building blocks ----------------------------- */

function Avatar({ p, size = 96, ring = "ring-4 ring-white" }: { p: Profile; size?: number; ring?: string }) {
  const s = { width: size, height: size };
  if (p.avatarUrl) {
    return <img src={p.avatarUrl} alt="" style={s} className={`rounded-full object-cover shadow-lg ${ring}`} />;
  }
  return (
    <div
      style={{ ...s, background: p.palette.accent, color: p.palette.ink }}
      className={`grid place-items-center rounded-full text-2xl font-black shadow-lg ${ring}`}
    >
      {initials(p) || "FX"}
    </div>
  );
}

function CircleAction({ icon, label, color = "#0b1a3a", href }: { icon: React.ReactNode; label: string; color?: string; href?: string }) {
  const inner = (
    <span className="grid h-11 w-11 place-items-center rounded-full text-white shadow-md" style={{ background: color }} title={label} aria-label={label}>
      {icon}
    </span>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}

function SocialRow({ p, dark = false }: { p: Profile; dark?: boolean }) {
  const cls = dark
    ? "grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white"
    : "grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700";
  const items: { k: keyof typeof p.socials; icon: React.ReactNode; href: (v: string) => string }[] = [
    { k: "whatsapp", icon: <MessageCircle className="h-4 w-4" />, href: (v) => `https://wa.me/${v.replace(/\D/g, "")}` },
    { k: "linkedin", icon: <Linkedin className="h-4 w-4" />, href: (v) => `https://linkedin.com/in/${v}` },
    { k: "facebook", icon: <Facebook className="h-4 w-4" />, href: (v) => `https://facebook.com/${v}` },
    { k: "instagram", icon: <Instagram className="h-4 w-4" />, href: (v) => `https://instagram.com/${v}` },
    { k: "twitter", icon: <Twitter className="h-4 w-4" />, href: (v) => `https://twitter.com/${v}` },
    { k: "tiktok", icon: <Music2 className="h-4 w-4" />, href: (v) => `https://tiktok.com/@${v}` },
  ];
  const active = items.filter((i) => p.socials[i.k]);
  if (!active.length) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {active.map((i) => (
        <a key={i.k} href={i.href(p.socials[i.k]!)} target="_blank" rel="noreferrer" className={cls}>
          {i.icon}
        </a>
      ))}
    </div>
  );
}

function ContactList({ p, dark = false }: { p: Profile; dark?: boolean }) {
  const row = "flex items-center gap-3 py-2.5";
  const iconCls = dark ? "grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white" : "grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-white";
  const sub = dark ? "text-white/60" : "text-slate-500";
  const txt = dark ? "text-white" : "text-slate-800";
  return (
    <div className={`divide-y ${dark ? "divide-white/10" : "divide-slate-200/70"}`}>
      {p.phones.map((ph) => (
        <a key={ph.number} href={`tel:${ph.number.replace(/\s/g, "")}`} className={row}>
          <span className={iconCls}><Phone className="h-4 w-4" /></span>
          <span className={`flex-1 text-sm font-medium ${txt}`}>{ph.number}<span className={`ml-2 text-[10px] ${sub}`}>{ph.operator}</span></span>
        </a>
      ))}
      {p.publicEmail && (
        <a href={`mailto:${p.publicEmail}`} className={row}>
          <span className={iconCls}><Mail className="h-4 w-4" /></span>
          <span className={`flex-1 truncate text-sm font-medium ${txt}`}>{p.publicEmail}</span>
        </a>
      )}
      {p.website && (
        <a href={p.website} target="_blank" rel="noreferrer" className={row}>
          <span className={iconCls}><Globe className="h-4 w-4" /></span>
          <span className={`flex-1 truncate text-sm font-medium ${txt}`}>{p.website.replace(/^https?:\/\//, "")}</span>
        </a>
      )}
      {p.city && (
        <div className={row}>
          <span className={iconCls}><MapPin className="h-4 w-4" /></span>
          <span className={`flex-1 text-sm font-medium ${txt}`}>{p.city}</span>
        </div>
      )}
    </div>
  );
}

function QRBadge({ p, url, size = 84, dark = false }: { p: Profile; url: string; size?: number; dark?: boolean }) {
  return (
    <div className={`rounded-2xl ${dark ? "bg-white" : "bg-white ring-1 ring-slate-200"} p-2 shadow-md`}>
      <QRCodeSVG value={url} size={size} level="H" fgColor={p.palette.ink} bgColor="#ffffff" />
    </div>
  );
}

function AddToContactsButton({ color, label = "Ajouter aux contacts" }: { color: string; label?: string }) {
  return (
    <button
      type="button"
      className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md"
      style={{ background: color }}
    >
      <UserPlus className="h-4 w-4" /> {label}
    </button>
  );
}

/* ------------------------------ Frame wrapper ------------------------------ */

function PhoneFrame({ children, variant }: { children: React.ReactNode; variant: "preview" | "full" | "print" }) {
  const isFull = variant === "full";
  return (
    <div
      className={`relative mx-auto overflow-hidden rounded-[28px] bg-white shadow-elev ${isFull ? "w-full max-w-[380px]" : "w-full"}`}
      style={{ aspectRatio: isFull ? "9 / 16" : "9 / 14" }}
    >
      {children}
    </div>
  );
}

/* --------------------------------- TEMPLATES -------------------------------- */

function TplVkardCover({ p, url, variant }: { p: Profile; url: string; variant: "preview" | "full" | "print" }) {
  return (
    <PhoneFrame variant={variant}>
      <div className="relative h-[38%] w-full" style={{ background: coverBg(p) }}>
        <button className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/80 text-white" title="QR">
          <QrCode className="h-4 w-4" />
        </button>
      </div>
      <div className="relative -mt-12 flex flex-col items-center px-5 pb-5">
        <Avatar p={p} size={96} />
        <div className="mt-3 text-center">
          <div className="text-lg font-bold text-slate-900">{p.firstName} {p.lastName}</div>
          <div className="text-sm text-slate-500">{p.title}</div>
          {p.company && <div className="text-xs text-slate-400">{p.company}</div>}
        </div>
        <div className="mt-4 grid w-full grid-cols-2 gap-2">
          <button className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white" style={{ background: p.palette.primary }}>
            <UserPlus className="h-3.5 w-3.5" /> Fiche contact
          </button>
          <button className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
            <Repeat className="h-3.5 w-3.5" /> Échanger
          </button>
        </div>
        {p.description && <p className="mt-3 text-center text-[12px] leading-relaxed text-slate-600 line-clamp-3">{p.description}</p>}
        <div className="mt-3"><SocialRow p={p} /></div>
      </div>
    </PhoneFrame>
  );
}

function TplSwapClassic({ p, url, variant }: { p: Profile; url: string; variant: "preview" | "full" | "print" }) {
  return (
    <PhoneFrame variant={variant}>
      <div className="relative h-[32%] w-full" style={{ background: coverBg(p) }} />
      <div className="relative -mt-14 flex flex-col items-center px-5 pb-5">
        <Avatar p={p} size={104} />
        <div className="mt-2 text-center">
          <div className="text-base font-semibold text-slate-900">{p.firstName} {p.lastName}</div>
          <div className="text-xs text-slate-500">{p.title}</div>
          <div className="text-xs text-slate-400">{p.company}</div>
        </div>
        <div className="mt-3 w-full"><ContactList p={p} /></div>
        <div className="mt-4 w-full"><AddToContactsButton color={p.palette.primary} /></div>
      </div>
      <div className="absolute right-3 top-3"><QRBadge p={p} url={url} size={48} /></div>
    </PhoneFrame>
  );
}

function TplTeamworkDramatic({ p, url, variant }: { p: Profile; url: string; variant: "preview" | "full" | "print" }) {
  return (
    <PhoneFrame variant={variant}>
      <div className="absolute inset-0" style={{ background: p.avatarUrl ? `url(${p.avatarUrl}) center/cover` : `linear-gradient(180deg, ${p.palette.ink}, ${p.palette.primary})` }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,.2) 0%, rgba(0,0,0,.0) 30%, rgba(0,0,0,.85) 100%)" }} />
      <div className="absolute inset-x-0 top-1/2 px-5 text-white">
        <div className="text-[26px] font-black uppercase leading-none tracking-tight">{p.firstName}<br />{p.lastName}</div>
        <div className="mt-1 text-xs text-white/80">{p.title}</div>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
          <span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: p.palette.accent, color: p.palette.ink }}>{(p.company?.[0] ?? "F").toUpperCase()}</span>
          {p.company || "FlexCard"}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 px-5 pb-4 pt-3">
        <div className="rounded-2xl bg-black/55 px-3 py-3 text-white backdrop-blur">
          <div className="flex items-center justify-center gap-2.5">
            <CircleAction icon={<Phone className="h-4 w-4" />} label="Appel" color="rgba(255,255,255,.15)" />
            <CircleAction icon={<Mail className="h-4 w-4" />} label="Mail" color="rgba(255,255,255,.15)" />
            <CircleAction icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp" color="rgba(255,255,255,.15)" />
            <CircleAction icon={<Share2 className="h-4 w-4" />} label="Partager" color={p.palette.primary} />
          </div>
          <div className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wider">À propos</div>
          {p.description && <p className="mt-2 text-center text-[11px] leading-relaxed text-white/85 line-clamp-3">{p.description}</p>}
        </div>
      </div>
    </PhoneFrame>
  );
}

function TplCurvePop({ p, url, variant }: { p: Profile; url: string; variant: "preview" | "full" | "print" }) {
  return (
    <PhoneFrame variant={variant}>
      <div className="relative h-[46%] w-full overflow-hidden">
        <div className="absolute inset-0" style={{ background: p.avatarUrl ? `url(${p.avatarUrl}) center/cover` : `linear-gradient(135deg, ${p.palette.ink}, ${p.palette.primary})` }} />
        <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute -bottom-px left-0 h-24 w-full">
          <path d="M0,80 C120,10 280,140 400,40 L400,120 L0,120 Z" fill={p.palette.primary} />
        </svg>
        <div className="absolute bottom-4 left-5 text-white drop-shadow">
          <div className="text-xl font-extrabold leading-tight">{p.firstName} {p.lastName}</div>
          <div className="text-xs opacity-90">{p.title}</div>
        </div>
      </div>
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-center justify-center gap-2">
          <CircleAction icon={<Phone className="h-4 w-4" />} label="Tel" color={p.palette.primary} />
          <CircleAction icon={<Mail className="h-4 w-4" />} label="Mail" color={p.palette.primary} />
          <CircleAction icon={<MessageCircle className="h-4 w-4" />} label="WA" color={p.palette.primary} />
          <CircleAction icon={<Share2 className="h-4 w-4" />} label="Partager" color={p.palette.ink} />
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-3 rounded-2xl px-3 py-2 text-white" style={{ background: p.palette.primary }}>
            <Facebook className="h-4 w-4" />
            <span className="text-sm font-semibold">Facebook</span>
            <span className="ml-auto text-[11px] opacity-80">Suis-nous</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl px-3 py-2 text-white" style={{ background: p.palette.ink }}>
            <Instagram className="h-4 w-4" />
            <span className="text-sm font-semibold">Instagram</span>
            <span className="ml-auto text-[11px] opacity-80">@{p.socials.instagram ?? p.slug}</span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function TplSoftBlue({ p, url, variant }: { p: Profile; url: string; variant: "preview" | "full" | "print" }) {
  return (
    <PhoneFrame variant={variant}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${p.palette.accent}40, #ffffff 60%)` }} />
      <div className="relative flex h-full flex-col items-center px-5 pt-8 pb-4">
        <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: p.palette.primary }}>{p.company || "Your Logo"}</div>
        <div className="relative mt-5">
          <Avatar p={p} size={120} />
          <span className="absolute -right-1 bottom-1 grid h-8 w-8 place-items-center rounded-full bg-white shadow ring-1 ring-slate-100" style={{ color: p.palette.primary }}>
            <Share2 className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-4 text-center">
          <div className="text-xl font-bold text-slate-900">{p.firstName}<br />{p.lastName}</div>
          <div className="mt-1 text-xs text-slate-500">{p.title}</div>
          <div className="text-xs text-slate-400">{p.company}</div>
        </div>
        {p.description && (
          <div className="mt-3 rounded-full px-4 py-1.5 text-[11px] italic text-white shadow" style={{ background: p.palette.primary }}>
            {p.description.slice(0, 50)}
          </div>
        )}
        <div className="mt-auto grid w-full grid-cols-3 gap-2 pt-4">
          <CircleBtn icon={<Phone className="h-4 w-4" />} label="Mobile" />
          <CircleBtn icon={<Mail className="h-4 w-4" />} label="E-Mail" />
          <CircleBtn icon={<QrCode className="h-4 w-4" />} label="Wallet" />
        </div>
      </div>
    </PhoneFrame>
  );
}

function CircleBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700">{icon}</span>
      <span className="text-[10px] font-medium text-slate-500">{label}</span>
    </div>
  );
}

function TplTiltedBlock({ p, url, variant }: { p: Profile; url: string; variant: "preview" | "full" | "print" }) {
  return (
    <PhoneFrame variant={variant}>
      <div className="absolute inset-0 h-[55%]" style={{ background: p.avatarUrl ? `url(${p.avatarUrl}) center/cover` : `linear-gradient(135deg, ${p.palette.accent}, ${p.palette.primary})` }} />
      <div
        className="absolute left-3 top-[28%] w-[58%] -rotate-3 rounded-xl p-3 text-white shadow-xl"
        style={{ background: p.palette.primary }}
      >
        <div className="text-base font-extrabold leading-tight">{p.firstName} <br /> {p.lastName}</div>
        <div className="mt-1 text-[11px] opacity-90">{p.title}</div>
        <div className="mt-1 text-[10px] opacity-75">{p.company}</div>
      </div>
      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4">
        <div className="flex items-center gap-2">
          <CircleAction icon={<Mail className="h-4 w-4" />} label="Mail" color={p.palette.primary} />
          <CircleAction icon={<Phone className="h-4 w-4" />} label="Tel" color={p.palette.primary} />
          <CircleAction icon={<MessageCircle className="h-4 w-4" />} label="WA" color={p.palette.primary} />
        </div>
        <div className="mt-3 rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color: p.palette.ink }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.palette.accent }} />
            {p.sector || "À propos"}
          </div>
          {p.description && <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600 line-clamp-3">{p.description}</p>}
        </div>
        <div className="mt-3"><AddToContactsButton color={p.palette.ink} /></div>
      </div>
    </PhoneFrame>
  );
}

function TplCartlyNight({ p, url, variant }: { p: Profile; url: string; variant: "preview" | "full" | "print" }) {
  return (
    <PhoneFrame variant={variant}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${p.palette.ink}, ${p.palette.primary})` }} />
      <div className="relative flex h-full flex-col px-5 pt-6 pb-5 text-white">
        <div className="flex items-center justify-between">
          <Avatar p={p} size={64} ring="ring-2 ring-white/40" />
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white/15"><Share2 className="h-4 w-4" /></button>
        </div>
        <div className="mt-3">
          <div className="text-lg font-bold">{p.firstName} {p.lastName}</div>
          <div className="text-xs text-white/70">{p.title}{p.company ? `, ${p.company}` : ""}</div>
          {p.publicEmail && <div className="mt-1 text-[11px] text-white/60">{p.publicEmail}</div>}
        </div>
        <div className="mt-4 space-y-2">
          <button className="flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold">
            <UserPlus className="h-4 w-4" /> Enregistrer le contact
          </button>
          <button className="flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold">
            <Send className="h-4 w-4" /> Envoyer mon contact
          </button>
        </div>
        {p.description && <p className="mt-3 text-center text-[11px] leading-relaxed text-white/75 line-clamp-3">{p.description}</p>}
        <div className="mt-auto">
          <SocialRow p={p} dark />
        </div>
      </div>
    </PhoneFrame>
  );
}

function TplBlueHeader({ p, url, variant }: { p: Profile; url: string; variant: "preview" | "full" | "print" }) {
  return (
    <PhoneFrame variant={variant}>
      <div className="relative h-[42%] w-full" style={{ background: p.avatarUrl ? `url(${p.avatarUrl}) center/cover` : `linear-gradient(135deg, ${p.palette.primary}, ${p.palette.ink})` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${p.palette.primary}cc 0%, transparent 50%, ${p.palette.ink}cc 100%)` }} />
        <div className="absolute bottom-3 left-4 right-4 text-white drop-shadow">
          <div className="text-xl font-extrabold leading-tight">{p.firstName} {p.lastName}</div>
          <div className="text-xs opacity-90">{p.title}</div>
          <div className="text-[11px] opacity-75">{p.company}</div>
        </div>
      </div>
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-center gap-2">
          <CircleAction icon={<Phone className="h-4 w-4" />} label="Tel" color={p.palette.ink} />
          <CircleAction icon={<Mail className="h-4 w-4" />} label="Mail" color={p.palette.ink} />
          <CircleAction icon={<MessageCircle className="h-4 w-4" />} label="WA" color={p.palette.ink} />
        </div>
        <div className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200/70 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <span className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: p.palette.ink }}>
              <UserPlus className="h-3 w-3" />
            </span>
            Contact
          </div>
          <div className="mt-1.5"><ContactList p={p} /></div>
        </div>
        <div className="mt-3"><AddToContactsButton color={p.palette.primary} /></div>
      </div>
    </PhoneFrame>
  );
}

/* --------------------------------- Renderer -------------------------------- */

const RENDERERS: Record<string, (args: { p: Profile; url: string; variant: "preview" | "full" | "print" }) => React.ReactElement> = {
  "vkard-cover": TplVkardCover,
  "swap-classic": TplSwapClassic,
  "teamwork-dramatic": TplTeamworkDramatic,
  "curve-pop": TplCurvePop,
  "soft-blue": TplSoftBlue,
  "tilted-block": TplTiltedBlock,
  "cartly-night": TplCartlyNight,
  "blue-header": TplBlueHeader,
};

export function BusinessCard({ profile, variant = "preview", publicUrl }: Props) {
  const url = publicUrlFor(profile, publicUrl);
  const Render = RENDERERS[profile.templateId] ?? TplVkardCover;
  return <Render p={profile} url={url} variant={variant} />;
}

export function PrintableCard({ profile, side }: { profile: Profile; side: "recto" | "verso" }) {
  const url = `https://flexcard.app/c/${profile.slug}`;
  return (
    <div
      className="relative mx-auto flex aspect-[1.65/1] w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-2xl shadow-elev"
      style={{
        background: side === "verso" ? profile.palette.primary : "white",
        color: side === "verso" ? "white" : profile.palette.ink,
      }}
    >
      {side === "recto" ? (
        <>
          <div className="absolute top-5 left-5 text-xs font-semibold tracking-widest" style={{ color: profile.palette.primary }}>
            {(profile.company || `${profile.firstName} ${profile.lastName}`).toUpperCase()}
          </div>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-black/5">
            <QRCodeSVG value={url} size={180} level="H" fgColor={profile.palette.ink} bgColor="#fff" />
          </div>
          <div className="absolute bottom-3 right-4 text-[10px] uppercase tracking-[0.3em] opacity-30">flexcard</div>
        </>
      ) : (
        <>
          <div className="text-3xl font-black tracking-tight">FlexCard</div>
          <div className="mt-1 text-xs opacity-80">Une carte. Mille connexions.</div>
        </>
      )}
    </div>
  );
}

export { Download };
