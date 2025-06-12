"use client";

import { GithubSignIn } from "@/components/github-sign-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { validationSchema, ValidationSchema } from "@/lib/validations/auth";
import { signUpAction } from "./action";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const Page = () => {
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<ValidationSchema>({
  resolver: zodResolver(validationSchema),
  mode: "onChange",
});

  const onSubmit = async (data: ValidationSchema) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    await signUpAction(formData);
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

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
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Input
            {...register("password")}
            placeholder="Password"
            type="password"
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Sign Up"}
        </Button>
      </form>

      <div className="text-center">
        <Button asChild variant="link">
          <Link href="/sign-in">Already have an account? Sign in</Link>
        </Button>
      </div>
    </div>
  );
};

export default Page;
