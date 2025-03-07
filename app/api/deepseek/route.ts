import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    console.log("Prompt Received: ", prompt);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("API key is missing");
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    // 🔹 Send request to OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-distill-llama-70b:free",
        messages: [
          { role: "user", content: prompt },
          { role: "system", content: "You are an AI assistant that provides clear, structured responses using Markdown for better readability." },
        ],
        stream: true,
      }),
    });

    if (!response.body) {
      return NextResponse.json({ error: "No response body from API" }, { status: 500 });
    }

    // 🔹 Create a readable stream for proper event-streaming
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Append chunk to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process full lines from buffer
            while (true) {
              const lineEnd = buffer.indexOf("\n");
              if (lineEnd === -1) break;

              const line = buffer.slice(0, lineEnd).trim();
              buffer = buffer.slice(lineEnd + 1);

              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0].delta.content;
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(content));
                  }
                } catch (e) {
                  console.error("JSON Parsing Error: ", e);
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error: ", error);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("API Call Error: ", error.message);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
