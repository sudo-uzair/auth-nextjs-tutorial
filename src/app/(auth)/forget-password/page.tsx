"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setMessage(null);
  const res = await fetch("/api/auth/forget-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (data.token && data.email) {
    window.location.href = `/reset-password?token=${data.token}&email=${encodeURIComponent(data.email)}`;  
  } else {
    setMessage(data.message);
  }
};
  return (
    <div className="w-full max-w-sm mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Button className="w-full" type="submit">Confirm Email</Button>
      </form>
      {message && <p className="text-center text-sm">{message}</p>}
    </div>
  );
}