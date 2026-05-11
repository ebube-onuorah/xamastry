import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface Question {
  id: string;
  domain: string;
  objective: string;
  text: string;
  options: string[];
  correct: string;
  explanation: string;
  reference?: string;
}

/**
 * Generate a CCNA instructor-style explanation for a wrong answer.
 */
export async function explainWrongAnswer(
  question: Question,
  studentAnswer: string,
): Promise<string> {
  const correctOption = question.options.find((o) => o.startsWith(question.correct));
  const studentOption = question.options.find((o) => o.startsWith(studentAnswer)) ?? studentAnswer;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are an expert CCNA instructor. Explain concepts clearly, concisely, and practically. Use analogies and memory tricks when helpful.",
      },
      {
        role: "user",
        content: `A student got this CCNA practice question wrong. Explain it clearly.

Question: ${question.text}

Options:
${question.options.join("\n")}

Correct answer: ${correctOption}
Student chose: ${studentOption}
CCNA Exam Objective: ${question.objective}

Reply in exactly 4 short, focused paragraphs:
1. **Why the correct answer is right** — the core concept explained
2. **Why "${studentAnswer}" is wrong** — address the specific misconception
3. **Memory trick or analogy** — something memorable to remember this
4. **Study reference** — cite chapter/section from the Odom CCNA Official Cert Guide

Keep each paragraph to 2-3 sentences maximum. Be direct and educational.`,
      },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  return completion.choices[0]?.message?.content ?? "Unable to generate explanation.";
}

/**
 * Generate a targeted hint for a CLI lab task without giving the answer.
 */
export async function generateLabHint(
  taskDescription: string,
  currentConfig: string,
  labContext: string,
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a CCNA lab instructor. Give hints that guide the student toward the solution without revealing the exact commands. Be encouraging.",
      },
      {
        role: "user",
        content: `Lab context: ${labContext}

Task to complete: ${taskDescription}

Current device config (show running-config output):
${currentConfig || "(No configuration yet)"}

Give a helpful hint (2-3 sentences) that points the student in the right direction without giving the exact IOS command.`,
      },
    ],
    max_tokens: 150,
    temperature: 0.5,
  });

  return completion.choices[0]?.message?.content ?? "Think about which IOS mode you need to be in for this task.";
}

/**
 * Generate a personalised study plan after a full exam.
 */
export async function generateStudyPlan(
  domainScores: Record<string, number>,
  weakObjectives: string[],
): Promise<string> {
  const scoresText = Object.entries(domainScores)
    .map(([domain, score]) => `- ${domain}: ${Math.round(score * 100)}%`)
    .join("\n");

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `A student just completed a CCNA 200-301 practice exam. Create a concise, actionable 1-week study plan.

Domain scores:
${scoresText}

Weakest objectives (below 60%):
${weakObjectives.join(", ") || "None identified"}

The study plan should:
1. Prioritize the weakest domains/objectives
2. Suggest specific Odom CCNA cert guide chapters to review
3. Recommend 2-3 practice activities per weak area
4. Be realistic for 1-2 hours of study per day

Format as a structured plan, not a wall of text. Keep it under 300 words.`,
      },
    ],
    max_tokens: 400,
    temperature: 0.4,
  });

  return completion.choices[0]?.message?.content ?? "Focus on your weakest domains first. Review the CCNA Official Cert Guide chapters for each failing objective.";
}
