import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded, getRankFromRating } from "@/lib/rating";

export async function GET() {
  const profile = await ensureSeeded();
  return NextResponse.json({
    ...profile,
    topicRatings: JSON.parse(profile.topicRatingsJson),
    strengths: JSON.parse(profile.strengthsJson),
    weaknesses: JSON.parse(profile.weaknessesJson),
    sprintAgenda: JSON.parse(profile.sprintAgendaJson),
    rank: getRankFromRating(profile.overallRating),
  });
}

export async function PATCH(req: Request) {
  try {
    await ensureSeeded();
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (typeof body.codename === "string") data.codename = body.codename.trim() || "SHADOW_DEV";
    if (typeof body.targetCompany === "string") data.targetCompany = body.targetCompany.trim();
    if (typeof body.sprintWeeksLeft === "number") data.sprintWeeksLeft = Math.max(1, Math.min(52, body.sprintWeeksLeft));
    if (typeof body.senseiDirectives === "string") data.senseiDirectives = body.senseiDirectives;
    if (Array.isArray(body.strengths)) data.strengthsJson = JSON.stringify(body.strengths);
    if (Array.isArray(body.weaknesses)) data.weaknessesJson = JSON.stringify(body.weaknesses);
    if (Array.isArray(body.sprintAgenda)) data.sprintAgendaJson = JSON.stringify(body.sprintAgenda);
    if (body.topicRatings && typeof body.topicRatings === "object") {
      data.topicRatingsJson = JSON.stringify(body.topicRatings);
      const vals = Object.values(body.topicRatings).filter((v): v is number => typeof v === "number");
      if (vals.length) {
        const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
        data.overallRating = avg;
        data.rankTitle = getRankFromRating(avg).title;
      }
    }

    const updated = await prisma.learnerProfile.update({
      where: { id: "default-runner" },
      data,
    });

    return NextResponse.json({
      ...updated,
      topicRatings: JSON.parse(updated.topicRatingsJson),
      strengths: JSON.parse(updated.strengthsJson),
      weaknesses: JSON.parse(updated.weaknessesJson),
      sprintAgenda: JSON.parse(updated.sprintAgendaJson),
      rank: getRankFromRating(updated.overallRating),
    });
  } catch (err) {
    console.error("Dossier PATCH error:", err);
    return NextResponse.json({ error: "Failed to save Sensei Dossier" }, { status: 500 });
  }
}
