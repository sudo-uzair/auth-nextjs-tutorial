"use client"
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { useSocket } from '@/context/SocketContext'

type Message = {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    createdAt?: string;
};

export default function ChatBox({ receiverId }: { receiverId: string }) {
    const { data: session } = useSession()
    const { socket } = useSocket()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [error, setError] = useState<string|null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (!socket) return;

        // Listen for incoming chat messages
        socket.on('chat:message', (message: Message) => {
            console.log('Received message in chat:', message);
            setMessages(prev => {
                // Check if message already exists to avoid duplicates
                if (prev.some(m => m.id === message.id)) {
                    return prev;
                }
                return [...prev, message];
            });
        });

        return () => {
            socket.off('chat:message');
        };
    }, [socket]);

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
        
        if (session?.user?.id && receiverId) {
            fetchMessages()
        }
    }, [receiverId, session?.user?.id])

    async function sendMessage() {
        if (!newMessage.trim() || !socket || !session?.user?.id) return;
        
        try {
            const messageData = {
                content: newMessage,
                receiverId,
                senderId: session.user.id
            };
            
            // First save to database to get the message ID
            const res = await axios.post('/api/messages', messageData);
            const savedMessage = res.data;
            console.log('Message saved:', savedMessage);
            
            // Then send via socket with the complete message including ID
            socket.emit('chat:message', savedMessage);
            
            // Optimistically update UI
            setMessages(prev => [...prev, savedMessage]);
            setNewMessage('');
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
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center">No messages yet.</p>
                ) : (
                    messages.map((msg, idx) => {
                        const isSender = msg.senderId === session?.user?.id;
                        return (
                            <div
                                key={msg.id || `${msg.senderId}-${msg.receiverId}-${idx}`}
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
                <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-3 bg-white">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1 border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}