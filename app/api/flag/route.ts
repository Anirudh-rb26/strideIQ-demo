import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 400 });
    }

    const { expense } = await req.json();
    if (!expense) {
      return NextResponse.json({ error: "Missing expense" }, { status: 400 });
    }

    const prompt = [
      "You are a finance compliance assistant.",
      'Classify the following corporate expense as either "Suspicious" or "Normal".',
      "Consider common violations (alcohol/entertainment if restricted, personal items, cash withdrawals, missing receipts), anomalies (unusually large amounts, repeated charges, out-of-hours/weekend, out-of-policy categories), or risky merchants.",
      "Return ONLY a compact JSON object with this exact shape:",
      '{"flag":"Suspicious"|"Normal","reason":"short reason"}',
      "Do not include any extra text.",
      "",
      `Expense: ${JSON.stringify(expense)}`,
    ].join("\n");

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey as string, // follow quickstart header style
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ error: text || "Gemini error" }, { status: 500 });
    }

    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let parsed: { flag?: string; reason?: string } = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      if (/suspicious/i.test(text)) parsed.flag = "Suspicious";
      else if (/normal/i.test(text)) parsed.flag = "Normal";
    }

    const flag: "Suspicious" | "Normal" =
      parsed.flag === "Suspicious" || parsed.flag === "Normal" ? parsed.flag : "Normal";

    return NextResponse.json({
      flag,
      reason: parsed.reason,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}
