"use client";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 p-4">
      <div className="flex flex-1 flex-col items-stretch gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-white text-base font-bold leading-tight">Agent</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <span className="text-gray-400 text-sm">Thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
