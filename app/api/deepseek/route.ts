import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json(); // ✅ Correct request parsing
    console.log("Prompt Received:", prompt);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("API key is missing");
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1-distill-llama-70b:free",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI Wrapper",
        },
      }
    );

    console.log("API Response:", response.data);

    return NextResponse.json({ reply: response.data.choices[0].message.content }); // ✅ Correct response
  } catch (error: any) {
    console.error("API call Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data || "Something went wrong" },
      { status: error.response?.status || 500 }
    );
  }
}
