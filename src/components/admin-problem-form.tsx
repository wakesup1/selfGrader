"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type TestCaseInput = {
  input: string;
  expected_output: string;
  is_sample: boolean;
};

export function AdminProblemForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [constraints, setConstraints] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [points, setPoints] = useState(100);
  const [timeLimit, setTimeLimit] = useState(2);
  const [memoryLimit, setMemoryLimit] = useState(256);
  const [testCases, setTestCases] = useState<TestCaseInput[]>([
    { input: "", expected_output: "", is_sample: true },
  ]);
  const [message, setMessage] = useState("");

  function updateCase(index: number, patch: Partial<TestCaseInput>) {
    setTestCases((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  async function submit() {
    setMessage("");

    const response = await fetch("/api/admin/problems", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        constraints,
        difficulty,
        points,
        time_limit: timeLimit,
        memory_limit: memoryLimit,
        testCases,
      }),
    });

    const data = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      setMessage(data.error ?? "Failed to create problem");
      return;
    }

    setMessage(data.message ?? "Problem created");
    setTitle("");
    setDescription("");
    setConstraints("");
    setPoints(100);
    setTimeLimit(2);
    setMemoryLimit(256);
    setTestCases([{ input: "", expected_output: "", is_sample: true }]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Problem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <Textarea
          placeholder="Constraints"
          value={constraints}
          onChange={(event) => setConstraints(event.target.value)}
        />

        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <Input type="number" value={points} onChange={(event) => setPoints(Number(event.target.value))} placeholder="Points" />
          <Input type="number" value={timeLimit} onChange={(event) => setTimeLimit(Number(event.target.value))} placeholder="Time limit" />
          <Input type="number" value={memoryLimit} onChange={(event) => setMemoryLimit(Number(event.target.value))} placeholder="Memory limit" />
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-zinc-200">Test Cases</h4>
          {testCases.map((testCase, index) => (
            <div key={index} className="rounded-lg border border-zinc-800 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-zinc-400">Case {index + 1}</p>
                <label className="text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={testCase.is_sample}
                    onChange={(event) => updateCase(index, { is_sample: event.target.checked })}
                    className="mr-2"
                  />
                  Sample
                </label>
              </div>
              <Textarea
                placeholder="Input"
                value={testCase.input}
                onChange={(event) => updateCase(index, { input: event.target.value })}
                className="mb-2"
              />
              <Textarea
                placeholder="Expected output"
                value={testCase.expected_output}
                onChange={(event) => updateCase(index, { expected_output: event.target.value })}
              />
            </div>
          ))}
          <Button
            variant="outline"
            type="button"
            onClick={() => setTestCases((current) => [...current, { input: "", expected_output: "", is_sample: false }])}
          >
            Add Test Case
          </Button>
        </div>

        <Button onClick={submit}>Save Problem</Button>
        {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
