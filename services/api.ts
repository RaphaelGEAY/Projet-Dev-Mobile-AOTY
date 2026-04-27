import { Platform } from "react-native";

import { Album, AlbumDetails, AlbumTrack } from "@/types/album";

export type DiscoverFeed =
  | "fresh"
  | "indie"
  | "hiphop"
  | "electronic"
  | "pop";

export type DiscoverFeedOption = {
  key: DiscoverFeed;
  label: string;
};

export const DISCOVER_FEEDS: DiscoverFeedOption[] = [
  { key: "fresh", label: "Fresh" },
  { key: "indie", label: "Indie" },
  { key: "hiphop", label: "Hip-Hop" },
  { key: "electronic", label: "Electronic" },
  { key: "pop", label: "Pop" },
];

export const QUICK_SEARCHES = ["charli xcx", "jazz", "shoegaze", "kendrick"];

const MUSICBRAINZ_BASE_URL = "https://musicbrainz.org/ws/2";
const APP_USER_AGENT = "aoty-clone-expo/1.0.0 (prototype app)";
const REQUEST_GAP_MS = 1100;

const discoverCache = new Map<DiscoverFeed, Album[]>();
const searchCache = new Map<string, Album[]>();
const detailCache = new Map<string, AlbumDetails>();

let queue: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

type MusicBrainzArtistCredit = {
  name?: string;
  joinphrase?: string;
  artist?: {
    name?: string;
  };
};

type MusicBrainzGenre = {
  name?: string;
  count?: number;
};

type MusicBrainzRating = {
  value?: number;
  "votes-count"?: number;
};

type MusicBrainzTrack = {
  id?: string;
  title?: string;
  number?: string;
  length?: number;
  "artist-credit"?: MusicBrainzArtistCredit[];
};

type MusicBrainzMedia = {
  tracks?: MusicBrainzTrack[];
  "track-count"?: number;
};

type MusicBrainzRelease = {
  id: string;
  date?: string;
  country?: string;
  status?: string;
  media?: MusicBrainzMedia[];
};

type MusicBrainzReleaseGroup = {
  id: string;
  title?: string;
  "primary-type"?: string;
  "secondary-types"?: string[];
  "first-release-date"?: string;
  "artist-credit"?: MusicBrainzArtistCredit[];
  genres?: MusicBrainzGenre[];
  rating?: MusicBrainzRating;
  releases?: MusicBrainzRelease[];
};

type MusicBrainzSearchResponse = {
  "release-groups"?: MusicBrainzReleaseGroup[];
};

const FEED_QUERIES: Record<DiscoverFeed, string> = {
  fresh: `primarytype:album AND firstreleasedate:[${new Date().getFullYear() - 1} TO *]`,
  indie: 'tag:"indie" AND primarytype:album',
  hiphop: 'tag:"hip hop" AND primarytype:album',
  electronic: 'tag:"electronic" AND primarytype:album',
  pop: 'tag:"pop" AND primarytype:album',
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRateLimit<T>(task: () => Promise<T>) {
  const scheduled = queue.then(async () => {
    const elapsed = Date.now() - lastRequestAt;
    const waitTime = Math.max(0, REQUEST_GAP_MS - elapsed);

    if (waitTime > 0) {
      await delay(waitTime);
    }

    lastRequestAt = Date.now();
    return task();
  });

  queue = scheduled.then(
    () => undefined,
    () => undefined,
  );

  return scheduled;
}

async function musicBrainzFetch<T>(path: string) {
  return withRateLimit(async () => {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (Platform.OS !== "web") {
      headers["User-Agent"] = APP_USER_AGENT;
    }

    const response = await fetch(`${MUSICBRAINZ_BASE_URL}${path}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`MusicBrainz request failed with ${response.status}`);
    }

    return (await response.json()) as T;
  });
}

function escapeLucenePhrase(value: string) {
  return value.replace(/([+\-!(){}[\]^"~*?:\\/]|&&|\|\|)/g, "\\$1");
}

function formatArtistCredits(credits?: MusicBrainzArtistCredit[]) {
  const artistName = credits
    ?.map((credit) => {
      const name = credit.name ?? credit.artist?.name ?? "";
      return `${name}${credit.joinphrase ?? ""}`;
    })
    .join("")
    .trim();

  return artistName && artistName.length > 0 ? artistName : "Unknown artist";
}

function yearFromDate(value?: string) {
  return value?.slice(0, 4) || "----";
}

function buildCoverUrl(id: string) {
  return `https://coverartarchive.org/release-group/${id}/front-500`;
}

function buildTypeLabel(group: MusicBrainzReleaseGroup) {
  return group["primary-type"] || group["secondary-types"]?.[0] || "Album";
}

function sortGenres(genres?: MusicBrainzGenre[]) {
  return [...(genres ?? [])]
    .sort((left, right) => (right.count ?? 0) - (left.count ?? 0))
    .map((genre) => genre.name)
    .filter((genre): genre is string => Boolean(genre))
    .slice(0, 5);
}

function mapAlbum(group: MusicBrainzReleaseGroup): Album {
  return {
    id: group.id,
    title: group.title || "Untitled release",
    artist: formatArtistCredits(group["artist-credit"]),
    coverUrl: buildCoverUrl(group.id),
    year: yearFromDate(group["first-release-date"]),
    typeLabel: buildTypeLabel(group),
  };
}

function sortFreshAlbums(albums: Album[]) {
  return [...albums].sort((left, right) => right.year.localeCompare(left.year));
}

function pickPreferredRelease(releases?: MusicBrainzRelease[]) {
  if (!releases || releases.length === 0) {
    return undefined;
  }

  return [...releases].sort((left, right) => {
    const leftOfficial = left.status === "Official" ? 0 : 1;
    const rightOfficial = right.status === "Official" ? 0 : 1;

    if (leftOfficial !== rightOfficial) {
      return leftOfficial - rightOfficial;
    }

    return (left.date || "9999").localeCompare(right.date || "9999");
  })[0];
}

function formatDuration(length?: number) {
  if (!length) {
    return undefined;
  }

  const totalSeconds = Math.round(length / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function mapTracks(media?: MusicBrainzMedia[], fallbackArtist?: string): AlbumTrack[] {
  const tracks = media?.flatMap((medium) => medium.tracks ?? []) ?? [];

  return tracks.map((track, index) => ({
    id: track.id || `${track.title || "track"}-${index}`,
    position: Number.parseInt(track.number ?? `${index + 1}`, 10) || index + 1,
    title: track.title || "Untitled track",
    artist: formatArtistCredits(track["artist-credit"]) || fallbackArtist || "Unknown artist",
    length: formatDuration(track.length),
  }));
}

function scoreFromRating(rating?: MusicBrainzRating) {
  if (typeof rating?.value !== "number") {
    return undefined;
  }

  return Math.round(rating.value * 20);
}

export async function fetchDiscoverAlbums(
  feed: DiscoverFeed,
  options?: { force?: boolean },
) {
  const cached = discoverCache.get(feed);
  if (cached && !options?.force) {
    return cached;
  }

  const response = await musicBrainzFetch<MusicBrainzSearchResponse>(
    `/release-group?fmt=json&limit=18&query=${encodeURIComponent(FEED_QUERIES[feed])}`,
  );

  const albums = (response["release-groups"] ?? []).map(mapAlbum);
  const normalized = feed === "fresh" ? sortFreshAlbums(albums) : albums;

  discoverCache.set(feed, normalized);
  return normalized;
}

export async function searchAlbums(rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();

  if (query.length < 2) {
    return [];
  }

  const cached = searchCache.get(query);
  if (cached) {
    return cached;
  }

  const safeQuery = escapeLucenePhrase(query);
  const expression = `(artist:"${safeQuery}" OR releasegroup:"${safeQuery}" OR tag:"${safeQuery}") AND primarytype:album`;
  const response = await musicBrainzFetch<MusicBrainzSearchResponse>(
    `/release-group?fmt=json&limit=20&query=${encodeURIComponent(expression)}`,
  );

  const albums = (response["release-groups"] ?? []).map(mapAlbum);
  searchCache.set(query, albums);
  return albums;
}

export async function fetchAlbumDetails(id: string) {
  const cached = detailCache.get(id);
  if (cached) {
    return cached;
  }

  const group = await musicBrainzFetch<MusicBrainzReleaseGroup>(
    `/release-group/${id}?fmt=json&inc=artist-credits+genres+ratings+releases`,
  );

  const preferredRelease = pickPreferredRelease(group.releases);
  let release: MusicBrainzRelease | undefined;

  if (preferredRelease?.id) {
    release = await musicBrainzFetch<MusicBrainzRelease>(
      `/release/${preferredRelease.id}?fmt=json&inc=artist-credits+recordings+media`,
    );
  }

  const artist = formatArtistCredits(group["artist-credit"]);
  const tracks = mapTracks(release?.media, artist);
  const trackCount =
    tracks.length ||
    release?.media?.reduce((total, medium) => total + (medium["track-count"] ?? 0), 0) ||
    0;

  const details: AlbumDetails = {
    ...mapAlbum(group),
    releaseDate: preferredRelease?.date || group["first-release-date"] || "Unknown",
    releaseCountry: preferredRelease?.country || "Unknown",
    releaseStatus: preferredRelease?.status || "Unknown",
    communityScore: scoreFromRating(group.rating),
    ratingCount: group.rating?.["votes-count"] ?? 0,
    genres: sortGenres(group.genres),
    trackCount,
    tracks,
  };

  detailCache.set(id, details);
  return details;
}
