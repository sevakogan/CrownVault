import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { brand, model, reference_number, year, condition, dealer_notes } =
    await request.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "AI not configured" },
      { status: 500 }
    );
  }

  const prompt = `Write a compelling, professional 2-3 sentence description for a luxury watch listing on a B2B dealer marketplace. Keep it concise and factual. Do not use flowery language or exclamation marks. Focus on what matters to dealers: authenticity, condition details, and value.

Watch details:
- Brand: ${brand}
- Model: ${model}
${reference_number ? `- Reference: ${reference_number}` : ""}
${year ? `- Year: ${year}` : ""}
- Condition: ${condition}
${dealer_notes ? `- Dealer notes: ${dealer_notes}` : ""}

Write only the description, nothing else.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 256,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const description = data.content?.[0]?.text || "";

    return NextResponse.json({ description });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}
