import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useMemo } from "react";
import type { AppState, Profile, Organization, ProspectLink } from "./types";
import { seedState } from "./seed";
import { generatePremiumCode } from "./utils";

type Actions = {
  // auth
  requestOtp: (email: string) => void;
  verifyOtp: (email: string, code: string) => Profile | null;
  signOut: () => void;
  // profile
  upsertProfile: (p: Profile) => void;
  updateCurrent: (patch: Partial<Profile>) => void;
  // premium
  buyPremium: () => string;
  buyOrgPremium: (orgId: string) => string;
  // org
  upsertOrg: (o: Organization) => void;
  // prospect link (simulate a scan from a phone)
  recordScan: (profileId: string, scannerPhone: string, contactName?: string) => void;
  // resets
  resetAll: () => void;
};

export const useApp = create<AppState & Actions>()(
  persist(
    (set, get) => ({
      ...seedState,
      requestOtp: (email) => set({ pendingEmail: email.toLowerCase().trim() }),
      verifyOtp: (email, code) => {
        if (code !== "123456") return null;
        const e = email.toLowerCase().trim();
        const found = Object.values(get().profiles).find((p) => p.email.toLowerCase() === e);
        if (found) {
          set({ currentProfileId: found.id, pendingEmail: null });
          return found;
        }
        // Nouveau compte vide pour onboarding
        const id = `u${Date.now()}`;
        const draft: Profile = {
          id, slug: id, email: e, kind: "particulier",
          firstName: "", lastName: "", title: "", sector: "",
          phones: [], socials: {}, gallery: [],
          templateId: "vkard-cover",
          palette: { primary: "#2563eb", accent: "#0ea5e9", ink: "#0b1a3a" },
          hasPremium: false, prospects: [], createdAt: Date.now(),
        };
        set((s) => ({
          profiles: { ...s.profiles, [id]: draft },
          currentProfileId: id,
          pendingEmail: null,
        }));
        return draft;
      },
      signOut: () => set({ currentProfileId: null }),
      upsertProfile: (p) => set((s) => ({ profiles: { ...s.profiles, [p.id]: p } })),
      updateCurrent: (patch) =>
        set((s) => {
          const id = s.currentProfileId;
          if (!id) return s;
          const cur = s.profiles[id];
          return { profiles: { ...s.profiles, [id]: { ...cur, ...patch } } };
        }),
      buyPremium: () => {
        const code = generatePremiumCode();
        set((s) => {
          const id = s.currentProfileId;
          if (!id) return s;
          const cur = s.profiles[id];
          return { profiles: { ...s.profiles, [id]: { ...cur, hasPremium: true, premiumCode: code } } };
        });
        return code;
      },
      buyOrgPremium: (orgId) => {
        const code = generatePremiumCode();
        set((s) => {
          const org = s.organizations[orgId];
          if (!org) return s;
          return { organizations: { ...s.organizations, [orgId]: { ...org, hasPremiumPack: true, premiumCode: code } } };
        });
        return code;
      },
      upsertOrg: (o) => set((s) => ({ organizations: { ...s.organizations, [o.id]: o } })),
      recordScan: (profileId, scannerPhone, contactName) => {
        set((s) => {
          const p = s.profiles[profileId];
          if (!p) return s;
          const existing = p.prospects.find((x) => x.phone === scannerPhone);
          let prospects: ProspectLink[];
          if (existing) {
            prospects = p.prospects.map((x) =>
              x.phone === scannerPhone ? { ...x, visits: x.visits + 1, lastVisitAt: Date.now() } : x,
            );
          } else {
            prospects = [
              ...p.prospects,
              { phone: scannerPhone, contactName, firstScanAt: Date.now(), visits: 1, lastVisitAt: Date.now() },
            ];
          }
          return { profiles: { ...s.profiles, [profileId]: { ...p, prospects } } };
        });
      },
      resetAll: () => set({ ...seedState }),
    }),
    {
      name: "flexcard-mock-v3",
      storage: createJSONStorage(() => (typeof window === "undefined" ? undefined as any : localStorage)),
      partialize: (s) => ({
        profiles: s.profiles,
        organizations: s.organizations,
        currentProfileId: s.currentProfileId,
        pendingEmail: s.pendingEmail,
      }),
    },
  ),
);

export function useCurrentProfile(): Profile | null {
  return useApp((s) => (s.currentProfileId ? s.profiles[s.currentProfileId] ?? null : null));
}

export function useProfileBySlug(slug: string): Profile | null {
  return useApp((s) => Object.values(s.profiles).find((p) => p.slug === slug) ?? null);
}

export function useProfileByPremiumCode(code: string) {
  const profiles = useApp((s) => s.profiles);
  const organizations = useApp((s) => s.organizations);
  return useMemo(() => {
    const normalized = code.toUpperCase();
    const u = Object.values(profiles).find((p) => p.premiumCode?.toUpperCase() === normalized);
    const o = Object.values(organizations).find((o) => o.premiumCode?.toUpperCase() === normalized);
    return { profile: u ?? null, org: o ?? null };
  }, [code, organizations, profiles]);
}

export function useStats() {
  const profilesById = useApp((s) => s.profiles);
  const organizations = useApp((s) => s.organizations);
  return useMemo(() => {
    const profiles = Object.values(profilesById);
    const orgs = Object.values(organizations);
    return {
      total: profiles.length,
      premium: profiles.filter((p) => p.hasPremium).length +
        orgs.filter((o) => o.hasPremiumPack).length,
      pro: profiles.filter((p) => p.kind === "entreprise").length + orgs.length,
      informel: profiles.filter((p) => p.kind === "informel").length,
    };
  }, [organizations, profilesById]);
}
