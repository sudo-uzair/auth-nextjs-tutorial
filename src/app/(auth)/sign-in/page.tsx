"use client";

import { GithubSignIn } from "@/components/github-sign-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter} from "next/navigation";

const SignInPage = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.ok) {
        // Refresh session and redirect
        await getSession();
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Invalid credentials. Please check your email and password.");
      }
    } catch (error) {
      setError("An error occurred during sign in. Please try again.");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
      <GithubSignIn />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
        <Input 
          name="email" 
          placeholder="Email" 
          type="email" 
          required 
          disabled={isLoading}
          autoComplete="email"
        />
        <Input 
          name="password" 
          placeholder="Password" 
          type="password" 
          required 
          disabled={isLoading}
          autoComplete="current-password"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="text-center">
        <Button asChild variant="link">
          <Link href="/sign-up">Don&apos;t have an account? Sign up</Link>
        </Button>
      </div>
    </div>
  );
};

export default SignInPage;