"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Mode = "login" | "signup";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit() {
    const supabase = createClient();

    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage("Account created. Please check your email for confirmation if enabled.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          setMessage(error.message);
          return;
        }

        router.push("/problems");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Login" : "Create account"}</CardTitle>
        <CardDescription>
          Use Supabase Auth with email and password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === "signup" && (
          <Input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
          />
        )}
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
        />
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
        />
        <Button className="w-full" onClick={submit} disabled={loading}>
          {loading ? "Working..." : mode === "login" ? "Login" : "Sign up"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => setMode((current) => (current === "login" ? "signup" : "login"))}
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
        </Button>
        {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
