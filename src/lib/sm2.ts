// SM-2 Spaced Repetition Algorithm
// Based on the SuperMemo SM-2 algorithm (1987)
// quality: 0-2 = fail, 3-5 = correct (5 = perfect recall)

export interface CardState {
  userId: string;
  questionId: string;
  easeFactor: number;    // EF: starts at 2.5, minimum 1.3
  interval: number;      // days until next review
  repetitions: number;   // number of successful reviews
  nextReview: Date;
  updatedAt: Date;
}

/**
 * Update SM-2 card state based on response quality.
 * @param card Current card state
 * @param quality 0-5 score (0-2 = failed, 3-5 = passed)
 * @returns New card state
 */
export function updateSM2(card: CardState, quality: 0 | 1 | 2 | 3 | 4 | 5): CardState {
  let { easeFactor, interval, repetitions } = card;

  if (quality < 3) {
    // Failed — reset repetitions and interval
    repetitions = 0;
    interval = 1;
  } else {
    // Passed — advance interval
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor); // never below 1.3

  const nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReview,
    updatedAt: new Date(),
  };
}

/**
 * Create a fresh card state for a new question.
 */
export function createCardState(userId: string, questionId: string): CardState {
  return {
    userId,
    questionId,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Convert answer correctness and timing to SM-2 quality score.
 * - Wrong answer → quality 1
 * - Correct but slow (>15s) → quality 3
 * - Correct and moderate (5-15s) → quality 4
 * - Correct and fast (<5s) → quality 5
 */
export function answerToQuality(correct: boolean, timeMs?: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (!correct) return 1;
  if (!timeMs) return 4;
  const timeS = timeMs / 1000;
  if (timeS < 5) return 5;
  if (timeS < 15) return 4;
  return 3;
}
