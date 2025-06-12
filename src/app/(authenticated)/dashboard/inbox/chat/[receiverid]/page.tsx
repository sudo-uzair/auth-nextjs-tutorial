// /dashboard/inbox/chat/[receiverId]/page.tsx
"use client"
import { useParams } from 'next/navigation'
import ChatBox from '@/components/chatbox/page'

export default function ChatPage() {
const params = useParams();
const receiverId = typeof params.receiverid === "string" ? params.receiverid : Array.isArray(params.receiverid) ? params.receiverid[0] : undefined;
if (!receiverId) {
  return <div>No receiver ID provided</div>
}

return (
  <div className="p-4 w-full ">
    <ChatBox receiverId={receiverId} />
  </div>
)
}