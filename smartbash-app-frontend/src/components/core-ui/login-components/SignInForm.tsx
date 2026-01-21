"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SocialLoginButton from "./SocialLoginButton";
import { FormEvent } from "react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !password) throw new Error("Please fill in all fields");

      const response = await fetch("http://127.0.0.1:8000/api/auth/signin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Login failed");

      // Store in localStorage
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* IMAGE */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image
            src="/smartbash-signin.png"
            alt="SMARTBASH Login"
            className="w-50 h-auto rounded-md"
            width={200}     
            height={200}    
            priority
          />
        </div>
        <p className="text-gray-600">Sign in to your SMARTBASH account</p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* EMAIL */}
      <div>
        <label className="block mb-2 font-medium text-sm text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          required
        />
      </div>

      {/* PASSWORD */}
      <div className="space-y-2">
        <label className="block font-medium text-sm text-gray-700">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          required
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* LOGIN BUTTON */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full font-semibold py-3 rounded-full shadow-md transition-colors duration-200 ${
          isLoading
            ? "bg-green-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        } text-white`}
      >
        {isLoading ? "Signing in..." : "Login"}
      </button>

      {/* DIVIDER */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* SOCIAL LOGIN */}
      <SocialLoginButton onClick={() => console.log("Google login clicked")} />

      {/* SIGNUP LINK */}
      <p className="mt-8 text-center text-gray-600">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:underline"
        >
          Sign Up
        </Link>
      </p>

      {/* TERMS */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-green-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-green-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </form>
  );
}
