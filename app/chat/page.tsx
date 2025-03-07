"use client";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

type Message = {
  text: string;
  type: "user" | "bot";
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, type: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      console.log("Sending request to backend...");

      // ✅ Send request to backend
      const response = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      console.log("Response Status: ", response.status);
      if (!response.body) throw new Error("No response body received");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = "";

      setMessages((prev) => [...prev, { text: "", type: "bot" }]); // Temporary bot message

      // ✅ Read and display streamed response chunk by chunk
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        botMessage += chunk;

        setMessages((prev) => 
          prev.map((msg, i) =>
            msg.type === "bot" && i === prev.length - 1
              ? { ...msg, text: botMessage }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { text: "⚠️ AI is unavailable. Try again.", type: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2 animate-fade-in">
        Welcome to AI Chat
      </h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Chat with your AI assistant and get instant responses.
      </p>

      {/* Chat Box */}
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-4 h-[400px] overflow-y-auto border">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} mb-2`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs ${
                msg.type === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && <p className="text-gray-500">AI is thinking...</p>}
      </div>

      {/* Input Area */}
      <div className="w-full max-w-2xl flex items-center gap-2 mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()} // ✅ Send on Enter
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
