import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";

export type UserRole = "user" | "owner" | "rider" | "admin";

export interface AuthUser {
  id: string;
  authId: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  // 현재 세션 1회 확인 (앱 마운트 시)
  init: () => Promise<void>;
  // 세션 변경 반영 (AuthProvider에서 onAuthStateChange 콜백으로 호출)
  refreshFromSession: (authId: string) => Promise<void>;
  clearUser: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  // getSession으로 현재 세션만 확인 — onAuthStateChange 미포함
  init: async () => {
    set({ loading: true });
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadUserProfile(session.user.id, set);
    } else {
      set({ user: null, loading: false });
    }
  },

  // onAuthStateChange 콜백에서 호출
  refreshFromSession: async (authId: string) => {
    await loadUserProfile(authId, set);
  },

  clearUser: () => set({ user: null, loading: false }),

  signOut: async () => {
    await supabase.auth.signOut();
    // pick-role 쿠키 삭제 (미들웨어 역할 체크용)
    await fetch("/api/auth/session", { method: "DELETE" });
    set({ user: null });
  },
}));

async function loadUserProfile(
  authId: string,
  set: (partial: Partial<AuthState>) => void
) {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, profile_image")
    .eq("auth_id", authId)
    .single();

  if (error || !data) {
    set({ user: null, loading: false });
    return;
  }

  set({
    user: {
      id: data.id as string,
      authId,
      name: data.name as string,
      email: data.email as string,
      role: data.role as UserRole,
      profileImage: data.profile_image as string | null,
    },
    loading: false,
  });
}
