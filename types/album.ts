export type Album = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  year: string;
  typeLabel: string;
};

export type AlbumTrack = {
  id: string;
  position: number;
  title: string;
  artist: string;
  length?: string;
};

export type AlbumDetails = Album & {
  releaseDate: string;
  releaseCountry: string;
  releaseStatus: string;
  communityScore?: number;
  ratingCount: number;
  genres: string[];
  trackCount: number;
  tracks: AlbumTrack[];
};
