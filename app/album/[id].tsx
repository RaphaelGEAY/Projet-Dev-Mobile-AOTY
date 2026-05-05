import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";

import { fetchAlbumDetails } from "@/services/api";
import { useSocial } from "@/services/social";
import { AlbumDetails } from "@/types/album";
import { ReviewTarget, TrackReview } from "@/types/social";

const RATING_OPTIONS = [1, 2, 3, 4, 5];

function formatReviewDate(value: string) {
  const date = new Date(value);

  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

export default function AlbumDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const {
    currentUser,
    firebaseConfigured,
    getMyTrackReview,
    saveTrackReview,
    setupMessage,
    subscribeToTrackReviews,
  } = useSocial();
  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<TrackReview[]>([]);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(4);
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!params.id) {
        setError("Album not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const details = await fetchAlbumDetails(params.id);

        if (!cancelled) {
          setAlbum(details);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load this album.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  useEffect(() => {
    if (!album?.tracks.length) {
      setSelectedTrackId(null);
      return;
    }

    if (!selectedTrackId || !album.tracks.some((track) => track.id === selectedTrackId)) {
      setSelectedTrackId(album.tracks[0].id);
    }
  }, [album, selectedTrackId]);

  const selectedTrack = useMemo(
    () => album?.tracks.find((track) => track.id === selectedTrackId) ?? null,
    [album, selectedTrackId],
  );

  const selectedTarget = useMemo<ReviewTarget | null>(() => {
    if (!album || !selectedTrack) {
      return null;
    }

    return {
      albumId: album.id,
      albumTitle: album.title,
      trackId: selectedTrack.id,
      trackTitle: selectedTrack.title,
      artist: selectedTrack.artist || album.artist,
    };
  }, [album, selectedTrack]);

  const userReview = useMemo(
    () => (selectedTarget ? getMyTrackReview(selectedTarget) : undefined),
    [getMyTrackReview, selectedTarget],
  );

  useEffect(() => {
    setReviewStatus(null);

    if (userReview) {
      setReviewText(userReview.comment);
      setRating(userReview.rating);
      return;
    }

    setReviewText("");
    setRating(4);
  }, [userReview, selectedTrackId, currentUser?.id]);

  useEffect(() => {
    if (!selectedTarget || !firebaseConfigured) {
      setSelectedReviews([]);
      setReviewsError(null);
      setReviewsLoading(false);
      return;
    }

    setReviewsLoading(true);
    setReviewsError(null);

    const unsubscribe = subscribeToTrackReviews(
      selectedTarget,
      (reviews) => {
        setSelectedReviews(reviews);
        setReviewsLoading(false);
      },
      (nextError) => {
        setReviewsError(nextError);
        setReviewsLoading(false);
      },
    );

    return unsubscribe;
  }, [firebaseConfigured, selectedTarget, subscribeToTrackReviews]);

  const handleSaveReview = async () => {
    if (!selectedTarget) {
      setReviewStatus("Choisis un morceau avant de poster un avis.");
      return;
    }

    setSubmittingReview(true);

    const result = await saveTrackReview({
      ...selectedTarget,
      rating,
      comment: reviewText,
    });

    if (!result.ok) {
      setReviewStatus(result.error);
      setSubmittingReview(false);
      return;
    }

    setReviewStatus(
      userReview
        ? "Ton avis a ete mis a jour."
        : "Ton avis a ete publie sur ce morceau.",
    );
    setSubmittingReview(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: album?.title ?? "Album" }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color="#f4c95d" size="large" />
            <Text style={styles.stateText}>Loading album details...</Text>
          </View>
        ) : error || !album ? (
          <View style={styles.centerState}>
            <Text style={styles.stateTitle}>Album unavailable</Text>
            <Text style={styles.stateText}>{error ?? "Please try again later."}</Text>
          </View>
        ) : (
          <>
            <Image
              source={{ uri: album.coverUrl }}
              style={styles.cover}
              contentFit="cover"
              transition={200}
            />

            <Text style={styles.artist}>{album.artist}</Text>
            <Text style={styles.title}>{album.title}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaChip}>{album.year}</Text>
              <Text style={styles.metaChip}>{album.typeLabel}</Text>
              <Text style={styles.metaChip}>{album.trackCount} tracks</Text>
            </View>

            {album.communityScore ? (
              <View style={styles.scoreRow}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreValue}>{album.communityScore}</Text>
                  <Text style={styles.scoreLabel}>Community</Text>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreValue}>{album.ratingCount}</Text>
                  <Text style={styles.scoreLabel}>Votes</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Release info</Text>
              <Text style={styles.copy}>
                First release: {album.releaseDate || "Unknown"}{"\n"}
                Release status: {album.releaseStatus || "Unknown"}{"\n"}
                Country: {album.releaseCountry || "Unknown"}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Genres</Text>
              <View style={styles.genreWrap}>
                {album.genres.length > 0 ? (
                  album.genres.map((genre) => (
                    <Text key={genre} style={styles.genreChip}>
                      {genre}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.copy}>No genre tags were returned.</Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tracklist</Text>
              {album.tracks.length > 0 ? (
                album.tracks.map((track) => (
                  <Pressable
                    key={track.id}
                    style={[
                      styles.trackRow,
                      selectedTrackId === track.id && styles.trackRowActive,
                    ]}
                    onPress={() => setSelectedTrackId(track.id)}
                  >
                    <View style={styles.trackNumber}>
                      <Text style={styles.trackNumberText}>{track.position}</Text>
                    </View>
                    <View style={styles.trackMain}>
                      <Text style={styles.trackTitle}>{track.title}</Text>
                      <Text style={styles.trackArtist}>{track.artist}</Text>
                    </View>
                    <View style={styles.trackSide}>
                      {selectedTrackId === track.id ? (
                        <Text style={styles.trackReviewCount}>Selectionne</Text>
                      ) : null}
                      <Text style={styles.trackLength}>{track.length ?? "--:--"}</Text>
                    </View>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.copy}>
                  This release does not expose a tracklist in the selected API
                  response.
                </Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Avis sur les morceaux</Text>

              {selectedTrack ? (
                <>
                  <View style={styles.focusHeader}>
                    <View style={styles.focusText}>
                      <Text style={styles.focusLabel}>Morceau selectionne</Text>
                      <Text style={styles.focusTitle}>{selectedTrack.title}</Text>
                      <Text style={styles.focusArtist}>{selectedTrack.artist}</Text>
                    </View>
                    <View style={styles.focusBadge}>
                      <Text style={styles.focusBadgeText}>
                        {selectedReviews.length} avis
                      </Text>
                    </View>
                  </View>

                  {!firebaseConfigured ? (
                    <Text style={styles.copy}>
                      {setupMessage ??
                        "Ajoute la configuration Firebase pour activer les avis distants."}
                    </Text>
                  ) : currentUser ? (
                    <View style={styles.composer}>
                      <Text style={styles.composerLabel}>
                        {userReview ? "Modifier mon avis" : "Poster mon avis"}
                      </Text>

                      <View style={styles.ratingRow}>
                        {RATING_OPTIONS.map((option) => {
                          const active = option === rating;

                          return (
                            <Pressable
                              key={option}
                              style={[
                                styles.ratingChip,
                                active && styles.ratingChipActive,
                              ]}
                              onPress={() => setRating(option)}
                            >
                              <Text
                                style={[
                                  styles.ratingChipText,
                                  active && styles.ratingChipTextActive,
                                ]}
                              >
                                {option}/5
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>

                      <TextInput
                        value={reviewText}
                        onChangeText={setReviewText}
                        style={styles.reviewInput}
                        placeholder="Qu'est-ce qui marche sur ce morceau ?"
                        placeholderTextColor="#66707d"
                        multiline
                        textAlignVertical="top"
                        selectionColor="#f4c95d"
                      />

                      <Pressable
                        style={[
                          styles.publishButton,
                          submittingReview && styles.publishButtonDisabled,
                        ]}
                        onPress={() => {
                          if (!submittingReview) {
                            void handleSaveReview();
                          }
                        }}
                      >
                        <Text style={styles.publishButtonText}>
                          {submittingReview
                            ? "Publication..."
                            : userReview
                              ? "Mettre a jour"
                              : "Publier l'avis"}
                        </Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Text style={styles.copy}>
                      Connecte-toi dans l&apos;onglet Compte pour publier ton avis
                      sur ce morceau.
                    </Text>
                  )}

                  {reviewStatus ? (
                    <Text style={styles.reviewStatus}>{reviewStatus}</Text>
                  ) : null}

                  <View style={styles.reviewList}>
                    {reviewsLoading ? (
                      <Text style={styles.copy}>Chargement des avis Firebase...</Text>
                    ) : selectedReviews.length > 0 ? (
                      selectedReviews.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                          <View style={styles.reviewCardHeader}>
                            <View style={styles.reviewCardText}>
                              <Text style={styles.reviewAuthor}>
                                {review.authorName}
                              </Text>
                              <Text style={styles.reviewMeta}>
                                {currentUser?.id === review.authorId
                                  ? "Ton avis"
                                  : "Utilisateur"}{" "}
                                • {formatReviewDate(review.updatedAt)}
                              </Text>
                            </View>
                            <View style={styles.reviewRatingPill}>
                              <Text style={styles.reviewRatingText}>
                                {review.rating}/5
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.reviewBody}>{review.comment}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.copy}>
                        {reviewsError ??
                          "Aucun avis pour ce morceau pour l'instant. Sois le premier a en poster un."}
                      </Text>
                    )}
                  </View>
                </>
              ) : (
                <Text style={styles.copy}>
                  Aucun morceau disponible pour les avis sur cette release.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0b0d10",
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 18,
  },
  cover: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 24,
    backgroundColor: "#151921",
  },
  artist: {
    color: "#f4c95d",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  title: {
    color: "#f5f7fa",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 36,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metaChip: {
    backgroundColor: "#151921",
    color: "#d8dde6",
    borderColor: "#262d38",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "600",
  },
  scoreRow: {
    flexDirection: "row",
    gap: 12,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: "#11141a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f2530",
    padding: 18,
    gap: 6,
  },
  scoreValue: {
    color: "#f5f7fa",
    fontSize: 28,
    fontWeight: "800",
  },
  scoreLabel: {
    color: "#98a1af",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  section: {
    backgroundColor: "#11141a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f2530",
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    color: "#f5f7fa",
    fontSize: 18,
    fontWeight: "700",
  },
  copy: {
    color: "#98a1af",
    fontSize: 15,
    lineHeight: 23,
  },
  genreWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  genreChip: {
    backgroundColor: "#1a2117",
    color: "#c9ef76",
    borderColor: "#2b3821",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "600",
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
  },
  trackRowActive: {
    backgroundColor: "#151921",
    borderWidth: 1,
    borderColor: "#2b3821",
  },
  trackNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#151921",
    alignItems: "center",
    justifyContent: "center",
  },
  trackNumberText: {
    color: "#d8dde6",
    fontSize: 13,
    fontWeight: "700",
  },
  trackMain: {
    flex: 1,
    gap: 2,
  },
  trackSide: {
    alignItems: "flex-end",
    gap: 6,
  },
  trackTitle: {
    color: "#f5f7fa",
    fontSize: 15,
    fontWeight: "600",
  },
  trackArtist: {
    color: "#98a1af",
    fontSize: 13,
  },
  trackLength: {
    color: "#98a1af",
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  trackReviewCount: {
    color: "#c9ef76",
    fontSize: 12,
    fontWeight: "700",
  },
  focusHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  focusText: {
    flex: 1,
    gap: 4,
  },
  focusLabel: {
    color: "#f4c95d",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  focusTitle: {
    color: "#f5f7fa",
    fontSize: 20,
    fontWeight: "800",
  },
  focusArtist: {
    color: "#98a1af",
    fontSize: 14,
  },
  focusBadge: {
    backgroundColor: "#151921",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#262d38",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  focusBadgeText: {
    color: "#d8dde6",
    fontSize: 12,
    fontWeight: "700",
  },
  composer: {
    gap: 12,
  },
  composerLabel: {
    color: "#f5f7fa",
    fontSize: 15,
    fontWeight: "700",
  },
  ratingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  ratingChip: {
    backgroundColor: "#151921",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#262d38",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ratingChipActive: {
    backgroundColor: "#f4c95d",
    borderColor: "#f4c95d",
  },
  ratingChipText: {
    color: "#d8dde6",
    fontSize: 13,
    fontWeight: "700",
  },
  ratingChipTextActive: {
    color: "#11141a",
  },
  reviewInput: {
    minHeight: 120,
    backgroundColor: "#151921",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2530",
    color: "#f5f7fa",
    fontSize: 15,
    lineHeight: 22,
    padding: 14,
  },
  publishButton: {
    backgroundColor: "#f4c95d",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  publishButtonDisabled: {
    opacity: 0.7,
  },
  publishButtonText: {
    color: "#11141a",
    fontSize: 15,
    fontWeight: "800",
  },
  reviewStatus: {
    color: "#f4c95d",
    fontSize: 13,
    fontWeight: "600",
  },
  reviewList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: "#151921",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#262d38",
    padding: 14,
    gap: 10,
  },
  reviewCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  reviewCardText: {
    flex: 1,
    gap: 4,
  },
  reviewAuthor: {
    color: "#f5f7fa",
    fontSize: 15,
    fontWeight: "700",
  },
  reviewMeta: {
    color: "#98a1af",
    fontSize: 12,
    fontWeight: "600",
  },
  reviewRatingPill: {
    backgroundColor: "#1a2117",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2b3821",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  reviewRatingText: {
    color: "#c9ef76",
    fontSize: 12,
    fontWeight: "800",
  },
  reviewBody: {
    color: "#d8dde6",
    fontSize: 14,
    lineHeight: 21,
  },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 72,
    gap: 10,
  },
  stateTitle: {
    color: "#f5f7fa",
    fontSize: 22,
    fontWeight: "700",
  },
  stateText: {
    color: "#98a1af",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
});
