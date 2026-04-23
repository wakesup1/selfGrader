import { SUBMISSION_STATUS } from "@/lib/constants";

type Judge0Request = {
  source_code: string;
  language_id: number;
  stdin: string;
  cpu_time_limit: number;
  memory_limit: number;
};

type Judge0Response = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
  status: {
    id: number;
    description: string;
  };
};

export async function runJudge0(request: Judge0Request): Promise<Judge0Response> {
  const url = process.env.JUDGE0_URL;

  if (!url) {
    throw new Error("JUDGE0_URL is required");
  }

  const response = await fetch(`${url}/submissions?base64_encoded=false&wait=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.JUDGE0_API_KEY ? { "X-RapidAPI-Key": process.env.JUDGE0_API_KEY } : {}),
      ...(process.env.JUDGE0_API_HOST ? { "X-RapidAPI-Host": process.env.JUDGE0_API_HOST } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Judge0 request failed with ${response.status}`);
  }

  return (await response.json()) as Judge0Response;
}

export function mapJudge0Status(statusDescription: string): string {
  const status = statusDescription.toLowerCase();

  if (status.includes("accepted")) {
    return SUBMISSION_STATUS.ACCEPTED;
  }

  if (status.includes("wrong answer")) {
    return SUBMISSION_STATUS.WRONG_ANSWER;
  }

  if (status.includes("time limit")) {
    return SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED;
  }

  if (status.includes("compilation error")) {
    return SUBMISSION_STATUS.COMPILATION_ERROR;
  }

  if (status.includes("runtime") || status.includes("segmentation")) {
    return SUBMISSION_STATUS.RUNTIME_ERROR;
  }

  return SUBMISSION_STATUS.ERROR;
}
