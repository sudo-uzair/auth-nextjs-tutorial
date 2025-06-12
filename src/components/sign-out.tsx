"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useState } from "react";

const SignOut = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({ callbackUrl: "/sign-in" });
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Button 
        variant="outline" 
        onClick={handleSignOut}
        disabled={isLoading}
      >
        {isLoading ? "Signing out..." : "Sign Out"}
      </Button>
    </div>
  );
};

export { SignOut };