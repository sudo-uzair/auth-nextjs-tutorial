"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter(); 
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const token = params.get("token");
  const email = params.get("email");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
   
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, token, password }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setMessage(data.message);
    if (data.success) {
      setTimeout(() => router.push("/sign-in"), 2000);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          placeholder="New password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Input
          placeholder="Confirm new password"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
        <Button className="w-full" type="submit">Reset Password</Button>
      </form>
      {message && <p className="text-center text-sm">{message}</p>}
    </div>
  );
}