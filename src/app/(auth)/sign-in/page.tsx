"use client";

import { GithubSignIn } from "@/components/github-sign-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { validationSchema, ValidationSchema } from "@/lib/validations/auth";

const SignInPage = () => {
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    mode:"onChange"
  });

  const onSubmit = async (data: ValidationSchema) => {
    setServerError("");
    try {
      const res = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (res?.ok) {
        const session = await getSession();
        if (session?.user?.role === "user") {
          router.push("/client-dashboard");
        } else if (session?.user?.role === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
        router.refresh();
      } else {
        setServerError("Invalid credentials. Please check your email and password.");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setServerError("An error occurred during sign in. Please try again.");
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

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Input
            {...register("email")}
            placeholder="Email"
            type="email"
            disabled={isSubmitting}
            autoComplete="email"
          />
          
        </div>
 {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        <div>
          <Input
            {...register("password")}
            placeholder="Password"
            type="password"
            disabled={isSubmitting}
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}


      <Link href="/forget-password" className="text-sm  text-gray-500 underline cursor-pointer">forget password?</Link>
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
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
