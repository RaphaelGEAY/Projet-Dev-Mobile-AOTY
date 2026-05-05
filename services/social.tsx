import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  collection,
  setDoc,
  writeBatch,
} from "firebase/firestore";

import { auth, db, isFirebaseConfigured, missingFirebaseConfigKeys } from "@/services/firebase";
import {
  AccountSession,
  ReviewTarget,
  SignInPayload,
  SignUpPayload,
  TrackReview,
  TrackReviewDraft,
} from "@/types/social";

type AuthResult =
  | { ok: true; user: AccountSession }
  | { ok: false; error: string };

type ReviewResult = { ok: true } | { ok: false; error: string };

type SocialContextValue = {
  currentUser: AccountSession | null;
  myReviews: TrackReview[];
  authReady: boolean;
  firebaseConfigured: boolean;
  setupMessage: string | null;
  signUp: (payload: SignUpPayload) => Promise<AuthResult>;
  signIn: (payload: SignInPayload) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  saveTrackReview: (draft: TrackReviewDraft) => Promise<ReviewResult>;
  subscribeToTrackReviews: (
    target: ReviewTarget,
    onChange: (reviews: TrackReview[]) => void,
    onError?: (message: string) => void,
  ) => () => void;
  getMyTrackReview: (target: ReviewTarget) => TrackReview | undefined;
};

type ProfileDocument = {
  username?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ReviewDocument = {
  albumId?: string;
  albumTitle?: string;
  trackId?: string;
  trackTitle?: string;
  artist?: string;
  rating?: number;
  comment?: string;
  authorId?: string;
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
};

const SocialContext = createContext<SocialContextValue | null>(null);

const MONTHS = [
  "janvier",
  "fevrier",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "aout",
  "septembre",
  "octobre",
  "novembre",
  "decembre",
];

function normalizeText(value: string) {
  return value.trim();
}

function buildFallbackUsername(email?: string | null) {
  const base = email?.split("@")[0]?.trim();
  return base && base.length > 0 ? base : "listener";
}

function formatJoinedLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "date inconnue";
  }

  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function sortReviews(reviews: TrackReview[]) {
  return [...reviews].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

function mapAuthError(error: unknown) {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "Cette adresse email est deja utilisee.";
    case "auth/invalid-email":
      return "Entre une adresse email valide.";
    case "auth/weak-password":
      return "Choisis un mot de passe un peu plus solide.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email ou mot de passe incorrect.";
    case "auth/too-many-requests":
      return "Trop de tentatives. Reessaie un peu plus tard.";
    default:
      return "Firebase a refuse la demande. Verifie la configuration.";
  }
}

function mapFirestoreError() {
  return "Impossible de synchroniser les avis avec Firestore.";
}

function buildSetupMessage() {
  if (isFirebaseConfigured) {
    return null;
  }

  return `Firebase n'est pas encore configure dans l'app. Variables manquantes: ${missingFirebaseConfigKeys.join(
    ", ",
  )}`;
}

function buildTrackReviewId(target: ReviewTarget) {
  return `${target.albumId}__${target.trackId}`;
}

function toSession(user: User, profile?: ProfileDocument): AccountSession {
  const joinedAt =
    profile?.createdAt || user.metadata.creationTime || new Date().toISOString();
  const username =
    normalizeText(profile?.username || user.displayName || buildFallbackUsername(user.email));

  return {
    id: user.uid,
    username,
    email: profile?.email || user.email || "",
    joinedAt,
    joinedLabel: formatJoinedLabel(joinedAt),
  };
}

function mapReview(id: string, data: ReviewDocument): TrackReview {
  return {
    id,
    albumId: data.albumId || "",
    albumTitle: data.albumTitle || "",
    trackId: data.trackId || "",
    trackTitle: data.trackTitle || "",
    artist: data.artist || "",
    rating: data.rating || 0,
    comment: data.comment || "",
    authorId: data.authorId || "",
    authorName: data.authorName || "Utilisateur",
    createdAt: data.createdAt || new Date(0).toISOString(),
    updatedAt: data.updatedAt || data.createdAt || new Date(0).toISOString(),
  };
}

async function ensureProfile(user: User) {
  if (!db) {
    throw new Error("Firestore unavailable");
  }

  const profileRef = doc(db, "profiles", user.uid);
  const snapshot = await getDoc(profileRef);

  if (snapshot.exists()) {
    const profile = snapshot.data() as ProfileDocument;
    const username =
      normalizeText(profile.username || user.displayName || buildFallbackUsername(user.email));

    if (!profile.username || !profile.createdAt || !profile.email) {
      const now = profile.createdAt || user.metadata.creationTime || new Date().toISOString();
      await setDoc(
        profileRef,
        {
          username,
          email: user.email || profile.email || "",
          createdAt: now,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    }

    return toSession(user, {
      ...profile,
      username,
      email: user.email || profile.email || "",
      createdAt: profile.createdAt || user.metadata.creationTime || new Date().toISOString(),
    });
  }

  const createdAt = user.metadata.creationTime || new Date().toISOString();
  const username = normalizeText(user.displayName || buildFallbackUsername(user.email));

  await setDoc(profileRef, {
    username,
    email: user.email || "",
    createdAt,
    updatedAt: createdAt,
  });

  return toSession(user, {
    username,
    email: user.email || "",
    createdAt,
  });
}

export function SocialProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AccountSession | null>(null);
  const [myReviews, setMyReviews] = useState<TrackReview[]>([]);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      void (async () => {
        if (!user) {
          setCurrentUser(null);
          setMyReviews([]);
          setAuthReady(true);
          return;
        }

        try {
          const session = await ensureProfile(user);
          setCurrentUser(session);
        } catch {
          setCurrentUser(null);
        } finally {
          setAuthReady(true);
        }
      })();
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!db || !currentUser) {
      setMyReviews([]);
      return;
    }

    const reviewsQuery = query(
      collection(db, "profiles", currentUser.id, "reviews"),
      orderBy("updatedAt", "desc"),
    );

    return onSnapshot(
      reviewsQuery,
      (snapshot) => {
        setMyReviews(
          sortReviews(
            snapshot.docs.map((item) =>
              mapReview(item.id, item.data() as ReviewDocument),
            ),
          ),
        );
      },
      () => {
        setMyReviews([]);
      },
    );
  }, [currentUser]);

  const value = useMemo<SocialContextValue>(
    () => ({
      currentUser,
      myReviews,
      authReady,
      firebaseConfigured: isFirebaseConfigured,
      setupMessage: buildSetupMessage(),
      signUp: async (payload) => {
        if (!auth || !db || !isFirebaseConfigured) {
          return {
            ok: false,
            error: buildSetupMessage() || "Firebase n'est pas pret.",
          };
        }

        const username = normalizeText(payload.username);
        const email = normalizeText(payload.email).toLowerCase();
        const password = payload.password.trim();

        if (username.length < 2) {
          return {
            ok: false,
            error: "Choisis un pseudo d'au moins 2 caracteres.",
          };
        }

        if (!email.includes("@") || email.length < 5) {
          return {
            ok: false,
            error: "Entre une adresse email valide.",
          };
        }

        if (password.length < 6) {
          return {
            ok: false,
            error: "Le mot de passe doit faire au moins 6 caracteres.",
          };
        }

        try {
          const credential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(credential.user, { displayName: username });

          const createdAt = new Date().toISOString();
          await setDoc(doc(db, "profiles", credential.user.uid), {
            username,
            email,
            createdAt,
            updatedAt: createdAt,
          });

          const session: AccountSession = {
            id: credential.user.uid,
            username,
            email,
            joinedAt: createdAt,
            joinedLabel: formatJoinedLabel(createdAt),
          };

          setCurrentUser(session);
          return { ok: true, user: session };
        } catch (error) {
          return {
            ok: false,
            error: mapAuthError(error),
          };
        }
      },
      signIn: async (payload) => {
        if (!auth || !isFirebaseConfigured) {
          return {
            ok: false,
            error: buildSetupMessage() || "Firebase n'est pas pret.",
          };
        }

        const email = normalizeText(payload.email).toLowerCase();
        const password = payload.password.trim();

        if (!email.includes("@") || email.length < 5) {
          return {
            ok: false,
            error: "Entre une adresse email valide.",
          };
        }

        if (password.length < 6) {
          return {
            ok: false,
            error: "Le mot de passe doit faire au moins 6 caracteres.",
          };
        }

        try {
          const credential = await signInWithEmailAndPassword(auth, email, password);
          const session = await ensureProfile(credential.user);
          setCurrentUser(session);
          return { ok: true, user: session };
        } catch (error) {
          return {
            ok: false,
            error: mapAuthError(error),
          };
        }
      },
      signOut: async () => {
        if (!auth) {
          return;
        }

        await firebaseSignOut(auth);
      },
      saveTrackReview: async (draft) => {
        if (!db || !currentUser) {
          return {
            ok: false,
            error: "Connecte-toi pour publier un avis.",
          };
        }

        const comment = normalizeText(draft.comment);

        if (comment.length < 10) {
          return {
            ok: false,
            error: "Ton avis doit contenir au moins 10 caracteres.",
          };
        }

        if (draft.rating < 1 || draft.rating > 5) {
          return {
            ok: false,
            error: "La note doit etre comprise entre 1 et 5.",
          };
        }

        try {
          const reviewId = buildTrackReviewId(draft);
          const userReviewRef = doc(db, "profiles", currentUser.id, "reviews", reviewId);
          const trackReviewRef = doc(
            db,
            "albums",
            draft.albumId,
            "tracks",
            draft.trackId,
            "reviews",
            currentUser.id,
          );

          const existingReview = await getDoc(userReviewRef);
          const now = new Date().toISOString();
          const createdAt =
            (existingReview.data() as ReviewDocument | undefined)?.createdAt || now;

          const reviewPayload = {
            albumId: draft.albumId,
            albumTitle: draft.albumTitle,
            trackId: draft.trackId,
            trackTitle: draft.trackTitle,
            artist: draft.artist,
            rating: draft.rating,
            comment,
            authorId: currentUser.id,
            authorName: currentUser.username,
            createdAt,
            updatedAt: now,
          };

          const batch = writeBatch(db);
          batch.set(userReviewRef, reviewPayload);
          batch.set(trackReviewRef, reviewPayload);
          await batch.commit();

          return { ok: true };
        } catch {
          return {
            ok: false,
            error: mapFirestoreError(),
          };
        }
      },
      subscribeToTrackReviews: (target, onChange, onError) => {
        if (!db || !isFirebaseConfigured) {
          onChange([]);
          return () => undefined;
        }

        const reviewsQuery = query(
          collection(db, "albums", target.albumId, "tracks", target.trackId, "reviews"),
          orderBy("updatedAt", "desc"),
        );

        return onSnapshot(
          reviewsQuery,
          (snapshot) => {
            onChange(
              sortReviews(
                snapshot.docs.map((item) =>
                  mapReview(item.id, item.data() as ReviewDocument),
                ),
              ),
            );
          },
          () => {
            onChange([]);
            onError?.(mapFirestoreError());
          },
        );
      },
      getMyTrackReview: (target) =>
        myReviews.find(
          (review) =>
            review.albumId === target.albumId && review.trackId === target.trackId,
        ),
    }),
    [authReady, currentUser, myReviews],
  );

  return (
    <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);

  if (!context) {
    throw new Error("useSocial must be used within SocialProvider");
  }

  return context;
}
