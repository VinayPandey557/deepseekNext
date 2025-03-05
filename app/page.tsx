"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Welcome to AI Wrapper</h1>
      <p className="text-lg text-gray-600">Start chatting with AI-powered responses!</p>
      <button
        onClick={() => router.push("/auth/signup")}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
      >
        Get Started
      </button>
    </div>
  );
}
