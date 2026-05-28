export type MatchReason = {
  positive: boolean;
  key: string;
  weight: number;
};

export type CandidateScore = {
  score: number;
  reasons: MatchReason[];
};
