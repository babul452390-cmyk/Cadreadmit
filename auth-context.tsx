import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebase } from "./firebase";
import type { UserProfile } from "./types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  hasActiveSubscription: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  hasActiveSubscription: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { auth } = getFirebase();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const { db } = getFirebase();
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setProfile({ uid: user.uid, ...(snap.data() as Omit<UserProfile, "uid">) });
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, [user]);

  const isAdmin = profile?.role === "admin";
  const hasActiveSubscription =
    !!profile?.subscription &&
    profile.subscription.status === "active" &&
    (!profile.subscription.expiresAt ||
      profile.subscription.expiresAt.toMillis() > Date.now());

  const signOut = async () => {
    const { auth } = getFirebase();
    await fbSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, isAdmin, hasActiveSubscription, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
