"use client";

import Link from "next/link";
import Image from "next/image";
import SocialLoginButton from "./SocialLoginButton";

import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SignInFormValues = {
  email: string;
  password: string;
};

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<SignInFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/signin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      // Save tokens
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      // Redirect based on role 
      const role = data.role;

      if (role === "Resident") {
        window.location.href = "/dashboards/residents";
      } else if (role === "Services") {
        window.location.href = "/dashboards/services";
      } else if (role === "BrgyOfficials") {
        window.location.href = "/dashboards/officials";
      } else {
        throw new Error("Invalid role");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* IMAGE */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <Image
              src="/smartbash-signin.png"
              alt="SMARTBASH Login"
              width={220}
              height={220}
              priority
            />
          </div>
          <p className="text-lg text-gray-600">
            Sign in to your SMARTBASH account
          </p>
        </div>

        {/* API ERROR */}
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded text-lg">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <FormField
          control={form.control}
          name="email"
          rules={{ required: "Email is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="h-12 text-lg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PASSWORD */}
        <FormField
          control={form.control}
          name="password"
          rules={{ required: "Password is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  className="h-12 text-lg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-base text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </FormItem>
          )}
        />

        {/* BUTTON */}
        <Button
          type="submit"
          disabled={isLoading}
          variant="default"
          size="lg"
          className={`w-full h-11 rounded-full py-4 text-lg ${
            isLoading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isLoading ? "Signing in..." : "Login"}
        </Button>

        {/* DIVIDER */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-base">
            <span className="bg-white px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <SocialLoginButton onClick={() => console.log("Google login")} />

        <p className="text-center text-base text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </Form>
  );
}
