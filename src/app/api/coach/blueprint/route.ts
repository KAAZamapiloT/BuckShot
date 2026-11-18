import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/rating";
import { runBlueprintCoach } from "@/lib/ai";

export async function GET() {
  await ensureSeeded();
  const bp = await prisma.blueprintSession.findUnique({ where: { id: "default-blueprint" } });
  return NextResponse.json({
    scenarioTitle: bp?.scenarioTitle,
    nodes: JSON.parse(bp?.nodesJson || "[]"),
    edges: JSON.parse(bp?.edgesJson || "[]"),
    messages: JSON.parse(bp?.messagesJson || "[]"),
    rubric: JSON.parse(bp?.rubricJson || "{}"),
  });
}

export async function POST(req: Request) {
  try {
    const profile = await ensureSeeded();
    const body = await req.json();
    const { message, nodes, edges, action } = body;

    if (action === "save-board") {
      await prisma.blueprintSession.update({
        where: { id: "default-blueprint" },
        data: {
          nodesJson: JSON.stringify(nodes ?? []),
          edgesJson: JSON.stringify(edges ?? []),
        },
      });
      return NextResponse.json({ ok: true });
    }

    const bp = await prisma.blueprintSession.findUnique({ where: { id: "default-blueprint" } });
    const existingNodes = (nodes ?? JSON.parse(bp?.nodesJson || "[]")).map(
      (n: { id: string; data?: { label?: string } }) => ({
        id: n.id,
        label: n.data?.label ?? n.id,
      })
    );

    const dossierContext = `Codename: ${profile.codename} | Target: ${profile.targetCompany} | Directives: ${profile.senseiDirectives}`;

    const result = await runBlueprintCoach({
      userMessage: message,
      existingNodes,
      dossierContext,
    });

    const prevMessages = JSON.parse(bp?.messagesJson || "[]");
    const nextMessages = [
      ...prevMessages,
      { role: "user", text: message },
      { role: "sensei", expression: result.expression, text: result.reply },
    ];

    await prisma.blueprintSession.update({
      where: { id: "default-blueprint" },
      data: {
        messagesJson: JSON.stringify(nextMessages),
        rubricJson: JSON.stringify(result.rubric),
      },
    });

    return NextResponse.json({
      ...result,
      messages: nextMessages,
    });
  } catch (err) {
    console.error("Blueprint coach error:", err);
    return NextResponse.json({ error: "Blueprint coach error" }, { status: 500 });
  }
}
