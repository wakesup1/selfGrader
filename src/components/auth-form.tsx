"use client";

import { type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Mode = "login" | "signup";

export function AuthForm() {
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const mode: Mode = selectedMode ?? queryMode;

  function validateInputs() {
    if (!email.trim()) {
      return "Email is required.";
    }

    if (!password) {
      return "Password is required.";
    }

    if (mode === "signup") {
      const normalizedUsername = username.trim();

      if (normalizedUsername.length < 3) {
        return "Username must be at least 3 characters.";
      }

      if (password.length < 6) {
        return "Password must be at least 6 characters.";
      }
    }

    return null;
  }

  async function submit() {
    const supabase = createClient();

    setLoading(true);
    setMessage("");

    try {
      const validationError = validateInputs();
      if (validationError) {
        setMessage(validationError);
        return;
      }

      if (mode === "signup") {
        const normalizedUsername = username.trim();

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: normalizedUsername },
          },
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        if (data.session) {
          router.push("/problems");
          router.refresh();
          return;
        }

        setSelectedMode("login");
        setMessage("Account created. Please check your email for confirmation if enabled, then login.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          setMessage(error.message);
          return;
        }

        router.push("/problems");
        router.refresh();
      }
    } catch (error) {
      const fallback = "Cannot connect to authentication service. Please check Supabase settings and try again.";
      if (error instanceof Error && error.message) {
        setMessage(error.message);
      } else {
        setMessage(fallback);
      }
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    await submit();
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <div className="mb-3 grid grid-cols-2 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
          <Button
            type="button"
            variant={mode === "login" ? "default" : "ghost"}
            className="h-9"
            onClick={() => setSelectedMode("login")}
          >
            Login
          </Button>
          <Button
            type="button"
            variant={mode === "signup" ? "default" : "ghost"}
            className="h-9"
            onClick={() => setSelectedMode("signup")}
          >
            Sign up
          </Button>
        </div>
        <CardTitle>{mode === "login" ? "Login" : "Create account"}</CardTitle>
        <CardDescription>
          Use Supabase Auth with email and password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === "signup" && (
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              autoComplete="username"
              required
              minLength={3}
            />
          )}
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Working..." : mode === "login" ? "Login" : "Sign up"}
          </Button>
          <p className="text-center text-sm text-zinc-400">
            {mode === "login" ? "New here? Choose Sign up tab." : "Already have an account? Choose Login tab."}
          </p>
          {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
