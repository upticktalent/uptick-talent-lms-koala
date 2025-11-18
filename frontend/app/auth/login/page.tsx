"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { handleApiError } from "@/utils/handleApiError";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
    setError("");
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      const message = handleApiError(err) || "Failed to log in";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[hsl(var(--primary))] mb-4">
          Welcome!
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
          Access your courses, submit assignments, track your
          <br />
          progress, and stay on top of your learning goals all in
          <br />
          one place.
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-center mb-6">
          <p className="text-[hsl(var(--muted-foreground))] text-sm">
            Log in to your account
          </p>
        </div>

        {error && (
          <div className="bg-[hsl(var(--danger))]/10 border border-[hsl(var(--danger))] text-[hsl(var(--danger))] px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* EMAIL FIELD */}
        <div>
          <label
            htmlFor="email"
            className="block text-[hsl(var(--muted-foreground))] text-xs mb-2"
          >
            Email Address
          </label>

          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className={`w-full bg-[hsl(var(--input))] text-[hsl(var(--foreground))] border ${
              emailError ? "border-[hsl(var(--danger))]" : "border-transparent"
            } h-12 rounded`}
          />

          {emailError && (
            <p className="text-xs text-[hsl(var(--danger))] mt-1">
              {emailError}
            </p>
          )}
        </div>

        {/* PASSWORD FIELD */}
        <div>
          <label
            htmlFor="password"
            className="block text-[hsl(var(--muted-foreground))] text-xs mb-2"
          >
            Password
          </label>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full bg-[hsl(var(--input))] text-[hsl(var(--foreground))] border ${
                passwordError
                  ? "border-[hsl(var(--danger))]"
                  : "border-transparent"
              } h-12 rounded pr-10`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {showPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>

          {passwordError && (
            <p className="text-xs text-[hsl(var(--danger))] mt-1">
              {passwordError}
            </p>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full h-12 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] font-medium rounded cursor-pointer"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </Button>

        <Link
          href="/auth/forgot-password"
          className="text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}
