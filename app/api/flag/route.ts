import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 400 });
    }

    const { expenses } = await req.json();
    if (!expenses || !Array.isArray(expenses)) {
      return NextResponse.json({ error: "Missing expenses array" }, { status: 400 });
    }

    const prompt = [
      "You are a finance compliance assistant.",
      'Classify each of the following corporate expenses as either "Suspicious" or "Normal".',
      "Consider common violations (alcohol/entertainment if restricted, personal items, cash withdrawals, missing receipts), anomalies (unusually large amounts, repeated charges, out-of-hours/weekend, out-of-policy categories), or risky merchants.",
      "Return ONLY a JSON object where each key is the expense ID and the value is an object with flag and reason:",
      '{"expense_id_1":{"flag":"Suspicious"|"Normal","reason":"short reason"},"expense_id_2":{"flag":"Suspicious"|"Normal","reason":"short reason"}}',
      "Do not include any extra text.",
      "",
      "Expenses:",
      ...expenses.map(
        (expense, index) => `${index + 1}. ID: ${expense.id} - ${JSON.stringify(expense)}`
      ),
    ].join("\n");

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey as string,
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

    let parsed: Record<string, { flag?: string; reason?: string }> = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      // Fallback: create a default response for each expense
      expenses.forEach((expense: any) => {
        parsed[expense.id] = {
          flag: "Normal",
          reason: "Unable to parse response",
        };
      });
    }

    // Normalize the response to ensure all expenses have valid flags
    const result: Record<string, { flag: "Suspicious" | "Normal"; reason?: string }> = {};

    expenses.forEach((expense: any) => {
      const expenseResult = parsed[expense.id];
      const flag: "Suspicious" | "Normal" =
        expenseResult?.flag === "Suspicious" || expenseResult?.flag === "Normal"
          ? expenseResult.flag
          : "Normal";

      result[expense.id] = {
        flag,
        reason: expenseResult?.reason || "No reason provided",
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}
