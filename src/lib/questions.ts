import networkFundamentals from "@/content/questions/network-fundamentals.json";
import networkAccess from "@/content/questions/network-access.json";
import ipConnectivity from "@/content/questions/ip-connectivity.json";
import ipServices from "@/content/questions/ip-services.json";
import securityFundamentals from "@/content/questions/security-fundamentals.json";
import automation from "@/content/questions/automation.json";

export interface Question {
  id: string;
  domain: string;
  objective: string;
  difficulty: "easy" | "medium" | "hard";
  text: string;
  options: string[];
  correct: string;
  explanation: string;
  tags: string[];
  reference?: string;
}

export const ALL_QUESTIONS: Question[] = [
  ...networkFundamentals,
  ...networkAccess,
  ...ipConnectivity,
  ...ipServices,
  ...securityFundamentals,
  ...automation,
] as Question[];

export const DOMAINS = [
  { id: "network-fundamentals", label: "Network Fundamentals", weight: 0.20 },
  { id: "network-access", label: "Network Access", weight: 0.20 },
  { id: "ip-connectivity", label: "IP Connectivity", weight: 0.25 },
  { id: "ip-services", label: "IP Services", weight: 0.10 },
  { id: "security-fundamentals", label: "Security Fundamentals", weight: 0.15 },
  { id: "automation", label: "Automation & Programmability", weight: 0.10 },
] as const;

export function getQuestionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id);
}

export function getQuestionsByDomain(domain: string): Question[] {
  return ALL_QUESTIONS.filter((q) => q.domain === domain);
}

/**
 * Sample questions for a full exam respecting domain weight distribution.
 * Total: 120 questions
 */
export function sampleFullExam(): Question[] {
  const sampled: Question[] = [];
  for (const domain of DOMAINS) {
    const count = Math.round(120 * domain.weight);
    const domainQs = getQuestionsByDomain(domain.id);
    const shuffled = [...domainQs].sort(() => Math.random() - 0.5);
    sampled.push(...shuffled.slice(0, count));
  }
  return sampled.sort(() => Math.random() - 0.5);
}

/**
 * Get questions for practice mode, prioritising due card IDs then filling
 * with unseen questions.
 */
export function getPracticeQuestions(
  dueIds: string[],
  seenIds: Set<string>,
  count = 20,
): Question[] {
  const result: Question[] = [];

  // First: due cards (SM-2 review)
  for (const id of dueIds) {
    const q = getQuestionById(id);
    if (q) result.push(q);
    if (result.length >= count) break;
  }

  // Fill with unseen questions if not enough
  if (result.length < count) {
    const unseen = ALL_QUESTIONS.filter(
      (q) => !seenIds.has(q.id) && !dueIds.includes(q.id),
    ).sort(() => Math.random() - 0.5);
    result.push(...unseen.slice(0, count - result.length));
  }

  return result;
}
