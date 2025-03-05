"use client"

import { useState } from "react";
import axios from "axios";


export default function Chatbox() {
    const [prompt , setPrompt] = useState("");
    const[response , setResponse] = useState("");

    const handleSendMessage = async() => {
       try {
        const response = await axios.post("/api/deepseek", {
            prompt: prompt
        });
        setResponse(response.data.reply);
    } catch(error) {
        console.log("Error", error)
    }
    }

    return <div>
        <textarea 
        className="w-full h-32 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mt-10"
        placeholder="type your message...."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        />
        <button onClick={handleSendMessage} className="">Send</button>
        {response && <p className="mt-4 p-2 bg-gray-100 border-rounded my-4">{response}</p>}
    </div>
}