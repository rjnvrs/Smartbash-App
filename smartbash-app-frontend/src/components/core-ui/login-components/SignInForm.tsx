"use client";

import Link from "next/link";
import Image from "next/image";
import SocialLoginButton from "./SocialLoginButton";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";

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
import { API_BASE } from "@/lib/api";
import { setCookie } from "@/lib/cookies";

type SignInFormValues = {
  email: string;
  password: string;
};

type UserRole = "Resident" | "Services" | "BrgyOfficials" | "Admin";

function setFrontendAuthCookies(access: string, refresh: string, role: UserRole) {
  const maxAge = 60 * 60 * 24; // 1 day
  setCookie("access_token", access, maxAge);
  setCookie("refresh_token", refresh, maxAge * 7);
  setCookie("user_role", role, maxAge);
}

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const noticeMessage = useMemo(() => {
    if (!searchParams) return "";
    return searchParams.get("message") || "";
  }, [searchParams]);

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
      const response = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      const role: UserRole = data.role;
      setFrontendAuthCookies(data.access, data.refresh, role);

      switch (role) {
        case "Resident":
          window.location.href = "/dashboards/residents";
          break;
        case "Services":
          window.location.href = "/dashboards/services/map";
          break;
        case "BrgyOfficials":
          window.location.href = "/dashboards/officials";
          break;
        case "Admin":
          window.location.href = "/admin";
          break;
        default:
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* IMAGE */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/smartbash-signin.png"
              alt="SMARTBASH Login"
              width={180}
              height={180}
              priority
            />
          </div>
          <p className="text-base sm:text-lg text-gray-600">
            Sign in to your SMARTBASH account
          </p>
        </div>

        {/* NOTICE */}
        {noticeMessage && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded text-sm sm:text-base">
            {noticeMessage}
          </div>
        )}

        {/* API ERROR */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm sm:text-base">
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
              <FormLabel className="text-base sm:text-lg">
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 sm:h-12 text-sm sm:text-lg"
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
              <FormLabel className="text-base sm:text-lg">Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  className="h-11 sm:h-12 text-sm sm:text-lg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm sm:text-base text-blue-600 hover:underline"
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
          className={`w-full h-11 sm:h-12 rounded-full text-base sm:text-lg ${
            isLoading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isLoading ? "Signing in..." : "Login"}
        </Button>

        {/* DIVIDER */}
        <div className="relative my-3 sm:my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm sm:text-base">
            <span className="bg-white px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <SocialLoginButton onClick={() => console.log("Google login")} />

        {/* SIGNUP LINK */}
        <p className="text-center text-sm sm:text-base text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </Form>
  );
}
