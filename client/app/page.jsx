import { TypingIndicator } from "@/components/typing-indicator"

export default function Page() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
      <TypingIndicator />
    </div>
  );
}
