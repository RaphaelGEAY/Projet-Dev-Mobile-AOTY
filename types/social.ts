export type AccountSession = {
  id: string;
  username: string;
  email: string;
  joinedLabel: string;
  joinedAt: string;
};

export type ReviewTarget = {
  albumId: string;
  albumTitle: string;
  trackId: string;
  trackTitle: string;
  artist: string;
};

export type TrackReview = ReviewTarget & {
  id: string;
  rating: number;
  comment: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

export type SignUpPayload = {
  username: string;
  email: string;
  password: string;
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type TrackReviewDraft = ReviewTarget & {
  rating: number;
  comment: string;
};
