"use client"
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'

type Message = {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
};

export default function ChatBox({ receiverId }: { receiverId: string }) {
    const { data: session } = useSession()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [error, setError] = useState<string|null>(null)

    useEffect(() => {
        async function fetchMessages() {
            try {
                setError(null)
                const res = await axios.get(`/api/messages?receiverId=${receiverId}`)
                setMessages(res.data)
            } catch (err) {
                console.error("Failed to load messages:", err)
                setError('Failed to load messages')
            }
        }

        if (session?.user?.email && receiverId) {
            fetchMessages()
        }
    }, [receiverId, session?.user?.email])

    async function sendMessage() {
        try {
            const res = await axios.post('/api/messages', {
                content: newMessage,
                receiverId
            })
            setMessages([...messages, res.data])
            setNewMessage('')
        } catch (err) {
            console.error("Failed to send message:", err)
            setError('Failed to send message')
        }
    }
    if (error) return <div className="p-4 text-red-500">{error}</div>

 return (
  <div className="border w-full max-w-6xl mx-auto rounded-lg flex flex-col h-[500px]">
    <div className="p-4 border-b bg-gray-100">
      <h2 className="font-semibold text-lg text-gray-80">Chat</h2>
    </div>
    {/* chat */}
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
      {messages.length === 0 ? (
  <p className="text-sm text-gray-400 text-center">No messages yet.</p>
) : (
  messages.map((msg) => {
    const isSender = msg.senderId === session?.user?.id;
    return (
      <div
        key={msg.id}
        className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-xs p-3 rounded-lg text-sm ${
            isSender
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-90'
          }`}
        >
          {msg.content}
        </div>
      </div>
    );
  })
)}
    </div>
    <div className="border-t p-3 bg-white">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md  disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  </div>
)

}
