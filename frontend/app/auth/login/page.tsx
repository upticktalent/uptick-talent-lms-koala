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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  // --- VALIDATION ---
  const validate = () => {
    let valid = true;

    // Reset
    setEmailError("");
    setPasswordError("");

    // Email
    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    }

    // Password
    if (!password.trim()) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/lms/dashboard");
    } catch (err) {
      console.log(err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome!</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Access your courses, submit assignments, track your
          <br />
          progress, and stay on top of your learning goals all in
          <br />
          one place.
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm">Log in to your account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* EMAIL FIELD */}
        <div>
          <label htmlFor="email" className="block text-gray-400 text-xs mb-2">
            Email Address
          </label>

          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className={`w-full bg-white text-black border ${
              emailError ? "border-red-500" : "border-transparent"
            } h-12 rounded`}
          />

          {emailError && (
            <p className="text-xs text-red-400 mt-1">{emailError}</p>
          )}
        </div>

        {/* PASSWORD FIELD */}
        <div>
          <label
            htmlFor="password"
            className="block text-gray-400 text-xs mb-2"
          >
            Password
          </label>

          <div>
            <label
              htmlFor="password"
              className="block text-gray-400 text-xs mb-2"
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
                className={`w-full bg-white text-black border ${
                  passwordError ? "border-red-500" : "border-transparent"
                } h-12 rounded pr-10`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>

            {passwordError && (
              <p className="text-xs text-red-400 mt-1">{passwordError}</p>
            )}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded cursor-pointer"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </Button>

        <Link
          href="/auth/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}
