"use client";

import { useState } from "react";

interface ContentInputProps {
  onSubmit: (content: string) => void;
}

export function ContentInput({ onSubmit }: ContentInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="w-full space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste or type the content you want to memorize..."
        className="w-full h-40 p-4 bg-card border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent placeholder:text-muted transition-shadow"
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">
          {text.length > 0 && `${text.length} characters`}
        </span>
        <div className="flex items-center gap-2">
          {text.length > 0 && (
            <button
              onClick={() => setText("")}
              className="h-10 px-4 text-muted hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="h-10 px-6 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Add Card
          </button>
        </div>
      </div>
      <p className="text-xs text-muted text-center">
        Press Ctrl+Enter (Cmd+Enter on Mac) to add
      </p>
      <p>Made with ❤🧠 by Elisejane Plecnik</p>
    </div>
  );
}