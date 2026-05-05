import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import {
  AccountSession,
  ReviewTarget,
  SignInPayload,
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
  signIn: (payload: SignInPayload) => AuthResult;
  signOut: () => void;
  saveTrackReview: (draft: TrackReviewDraft) => ReviewResult;
  getTrackReviews: (target: ReviewTarget) => TrackReview[];
  getUserTrackReview: (target: ReviewTarget) => TrackReview | undefined;
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

const COMMUNITY_NAMES = [
  "Maya",
  "Nolan",
  "Lina",
  "Sofiane",
  "Camille",
  "Yanis",
  "Iris",
  "Noa",
];

const COMMUNITY_OPENERS = [
  "Le refrain me reste en tete a chaque ecoute.",
  "La prod laisse de l'espace a la voix et ca marche tres bien.",
  "C'est le morceau qui me donne envie de relancer l'album.",
  "Le pont apporte juste assez de tension avant la derniere partie.",
];

const COMMUNITY_CLOSERS = [
  "Je reviens surtout pour son energie.",
  "Ce n'est pas le plus ambitieux, mais il est vraiment efficace.",
  "Le mix pourrait etre plus massif, mais l'emotion passe.",
  "Il prend encore plus de relief quand on connait deja le reste du disque.",
];

function normalizeText(value: string) {
  return value.trim();
}

function hashValue(value: string) {
  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function formatJoinedLabel(date: Date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function sortReviews(reviews: TrackReview[]) {
  return [...reviews].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

function buildCommunityReviews(target: ReviewTarget) {
  const seed = hashValue(`${target.albumId}:${target.trackId}`);
  const count = 2 + (seed % 2);

  return Array.from({ length: count }, (_, index) => {
    const reviewSeed = hashValue(`${target.trackId}:${index}`);
    const authorName = COMMUNITY_NAMES[reviewSeed % COMMUNITY_NAMES.length];
    const opener = COMMUNITY_OPENERS[reviewSeed % COMMUNITY_OPENERS.length];
    const closer = COMMUNITY_CLOSERS[reviewSeed % COMMUNITY_CLOSERS.length];
    const month = reviewSeed % 12;
    const day = 1 + (reviewSeed % 26);

    return {
      id: `community-${target.trackId}-${index}`,
      albumId: target.albumId,
      albumTitle: target.albumTitle,
      trackId: target.trackId,
      trackTitle: target.trackTitle,
      artist: target.artist,
      rating: 3 + (reviewSeed % 3),
      comment: `${opener} ${closer}`,
      authorId: `community-${authorName.toLowerCase()}`,
      authorName,
      createdAt: new Date(Date.UTC(2025, month, day)).toISOString(),
      source: "community" as const,
    };
  });
}

export function SocialProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AccountSession | null>(null);
  const [trackReviews, setTrackReviews] = useState<TrackReview[]>([]);

  const myReviews = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return sortReviews(
      trackReviews.filter((review) => review.authorId === currentUser.id),
    );
  }, [currentUser, trackReviews]);

  const value = useMemo<SocialContextValue>(
    () => ({
      currentUser,
      myReviews,
      signIn: (payload) => {
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

        if (password.length < 4) {
          return {
            ok: false,
            error: "Le mot de passe doit faire au moins 4 caracteres.",
          };
        }

        const user = {
          id: email,
          username,
          email,
          joinedLabel: formatJoinedLabel(new Date()),
        };

        setCurrentUser(user);
        return { ok: true, user };
      },
      signOut: () => {
        setCurrentUser(null);
      },
      saveTrackReview: (draft) => {
        if (!currentUser) {
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

        const review: TrackReview = {
          ...draft,
          id: `${currentUser.id}:${draft.albumId}:${draft.trackId}`,
          rating: draft.rating,
          comment,
          authorId: currentUser.id,
          authorName: currentUser.username,
          createdAt: new Date().toISOString(),
          source: "user",
        };

        setTrackReviews((existing) =>
          sortReviews([
            review,
            ...existing.filter(
              (item) =>
                !(
                  item.authorId === currentUser.id &&
                  item.albumId === draft.albumId &&
                  item.trackId === draft.trackId
                ),
            ),
          ]),
        );

        return { ok: true };
      },
      getTrackReviews: (target) => {
        const localReviews = trackReviews.filter(
          (review) =>
            review.albumId === target.albumId && review.trackId === target.trackId,
        );

        return sortReviews([...localReviews, ...buildCommunityReviews(target)]);
      },
      getUserTrackReview: (target) => {
        if (!currentUser) {
          return undefined;
        }

        return trackReviews.find(
          (review) =>
            review.authorId === currentUser.id &&
            review.albumId === target.albumId &&
            review.trackId === target.trackId,
        );
      },
    }),
    [currentUser, myReviews, trackReviews],
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
