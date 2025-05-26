"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Message = {
    sender: "user" | "ai";
    text: string;
};

export default function ChatPage() {
    const { isSignedIn, userId } = useAuth();
    const router = useRouter();
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async () => {
        if (!question.trim()) return;

        const userMessage: Message = { sender: "user", text: question };
        setMessages((prev) => [...prev, userMessage]);
        setQuestion("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, userId }),
            });

            const data = await res.json();

            if (data.answer) {
                const words = data.answer.split(" ");
                let generatedText = "";
                for (let i = 0; i < words.length; i++) {
                    const delay = Math.min(30 + i * 2, 100);
                    await new Promise((res) => setTimeout(res, delay));
                    generatedText += (i > 0 ? " " : "") + words[i];
                    setMessages((prev) => {
                        const lastMsg = prev[prev.length - 1];
                        if (lastMsg?.sender === "ai") {
                            return [...prev.slice(0, -1), { sender: "ai", text: generatedText }];
                        } else {
                            return [...prev, { sender: "ai", text: generatedText }];
                        }
                    });
                }
            } else {
                alert("No answer received.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isSignedIn) {
        return <p className="text-white p-8">Please sign in to use the chat.</p>;
    }

    return (
        <div className="flex flex-col h-screen bg-black text-white">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
                <h1 className="text-xl font-bold">💬 PDF Chat</h1>
                <Link
                    href="/upload"
                    className="px-4 py-2 border border-white rounded hover:bg-white hover:text-black transition"
                >
                    Upload New PDF
                </Link>
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`w-full flex ${msg.sender === "ai" ? "justify-start" : "justify-end"} ${msg.sender === "ai" ? "mb-8" : "mb-2"}`}
                    >
                        <div
                            className={`px-4 py-2 rounded-lg whitespace-pre-wrap break-words ${msg.sender === "ai"
                                    ? "bg-gray-700 text-white max-w-lg"
                                    : "bg-gray-100 text-black max-w-[80%]"
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}



                <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="px-6 py-4 border-t border-gray-700 bg-black flex justify-center">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                    className="relative w-full max-w-2xl mx-auto"
                >
                    <input
                        type="text"
                        placeholder="Ask something..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full px-4 py-[15px] pr-12 rounded-md bg-black text-white border border-white focus:outline-none"
                    />

                    <button
                        type="submit"
                        disabled={loading || !question.trim()}
                        className={`absolute top-1/2 right-2 -translate-y-1/2 flex items-center justify-center bg-white text-black hover:bg-gray-300 transition-all duration-300 ease-in-out ${question.trim()
                            ? "w-10 h-10 rounded-full"
                            : "w-auto h-auto rounded-md px-3 py-2"
                            }`}
                    >
                        <span
                            className={`transition-opacity duration-300 ease-in-out ${question.trim()
                                ? "opacity-0 pointer-events-none"
                                : "opacity-100"
                                }`}
                        >
                            Send
                        </span>
                        <span
                            className={`absolute text-2xl font-bold transition-opacity duration-300 ease-in-out ${question.trim() ? "opacity-100" : "opacity-0 pointer-events-none"
                                }`}
                        >
                            ↑
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
}
