export function TypingIndicator() {
  return (
    <div
      className="flex items-center space-x-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
      <span className="sr-only">Typing...</span>
      <div
        className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div
        className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div
        className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
    </div>
  );
}
