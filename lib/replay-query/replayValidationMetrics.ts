interface ReplayValidationMetrics {
  invalidReplayCategoryCount: number;
  invalidContinuityCount: number;
  invalidSeverityCount: number;
  invalidSourceCount: number;
  invalidAdvisoryCount: number;
  aliasNormalizationCount: number;
}

const metrics: ReplayValidationMetrics = {
  invalidReplayCategoryCount: 0,
  invalidContinuityCount: 0,
  invalidSeverityCount: 0,
  invalidSourceCount: 0,
  invalidAdvisoryCount: 0,
  aliasNormalizationCount: 0,
};

export function recordInvalidReplayCategory() {
  metrics.invalidReplayCategoryCount += 1;
}
export function recordInvalidContinuity() {
  metrics.invalidContinuityCount += 1;
}
export function recordInvalidSeverity() {
  metrics.invalidSeverityCount += 1;
}
export function recordInvalidSource() {
  metrics.invalidSourceCount += 1;
}
export function recordInvalidAdvisory() {
  metrics.invalidAdvisoryCount += 1;
}
export function recordAliasNormalization() {
  metrics.aliasNormalizationCount += 1;
}

export function getReplayValidationMetrics(): ReplayValidationMetrics {
  return { ...metrics };
}
