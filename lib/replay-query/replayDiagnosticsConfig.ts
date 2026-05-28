export const replayDiagnosticsConfig = {
  metadataCompletenessWeight: 55,
  densityStabilityWeight: 30,
  continuityScopeWeight: 15,
  advisoryDensityThreshold: 0.35,
  reviewDensityThreshold: 0.3,
  compressionPenaltyCap: 20,
  compressionPenaltyDivisor: 2,
  densityCap: 0.6,
  confidenceThresholds: {
    highScore: 80,
    moderateScore: 55,
    highCompleteness: 0.9,
  },
  completenessWarningThreshold: 0.95,
} as const;
