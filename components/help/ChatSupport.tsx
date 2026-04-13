"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ChatSupport() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "support", text: "Hello! How can we help you today?" },
  ])
  const [input, setInput] = useState("")

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages([...messages, { sender: "user", text: input }])
    setInput("")
    // simulate support reply
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "support", text: "Thanks for your message! Our team will reply shortly." }])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-[400px] border rounded-lg">
      {/* <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-xs ${
              msg.sender === "user"
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="p-3 border-t flex gap-2">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div> */}
      <p>Page Will Update Shortly</p>
    </div>
  )
}
