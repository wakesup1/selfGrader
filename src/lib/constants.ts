export const JUDGE0_LANGUAGE_MAP = {
  71: { label: "Python 3", monaco: "python" },
  54: { label: "C++17", monaco: "cpp" },
  62: { label: "Java 17", monaco: "java" },
} as const;

export const STARTER_CODE: Record<number, string> = {
  71: "print('hello')\n",
  54: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  return 0;\n}\n",
  62: "public class Main {\n  public static void main(String[] args) {\n  }\n}\n",
};

export const SUBMISSION_STATUS = {
  ACCEPTED: "AC",
  WRONG_ANSWER: "WA",
  TIME_LIMIT_EXCEEDED: "TLE",
  RUNTIME_ERROR: "RE",
  COMPILATION_ERROR: "CE",
  ERROR: "ERR",
} as const;
