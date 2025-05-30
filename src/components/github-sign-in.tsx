"use client";

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react"; // Using lucide-react instead
import { signIn } from "next-auth/react";
import { useState } from "react";

const GithubSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("GitHub sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      className="w-full" 
      variant="outline" 
      onClick={handleGithubSignIn}
      disabled={isLoading}
    >
      <Github className="mr-2 h-4 w-4" />
      {isLoading ? "Connecting..." : "Continue with GitHub"}
    </Button>
  );
};

export { GithubSignIn };