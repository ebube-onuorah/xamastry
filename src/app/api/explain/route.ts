import { NextRequest, NextResponse } from "next/server";
import { explainWrongAnswer, generateStudyPlan } from "@/lib/groq";
import { getQuestionById } from "@/lib/questions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Study plan request from results page
    if (body.type === "study_plan") {
      const { domainScores, weakObjectives } = body;
      const plan = await generateStudyPlan(domainScores, weakObjectives);
      return NextResponse.json({ plan });
    }

    // Per-question explanation
    const { questionId, studentAnswer } = body;
    if (!questionId || !studentAnswer) {
      return NextResponse.json({ error: "Missing questionId or studentAnswer" }, { status: 400 });
    }

    const question = getQuestionById(questionId);
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const explanation = await explainWrongAnswer(question, studentAnswer);
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Explain API error:", error);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
