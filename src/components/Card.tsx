"use client";

import { useState } from "react";

interface CardProps {
  content: string;
  onDelete?: () => void;
  onPlay?: () => void;
}

export function Card({ content, onDelete, onPlay }: CardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewLength = 150;
  const needsTruncation = content.length > previewLength;

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 transition-shadow hover:shadow-lg">
      <div className="text-foreground leading-relaxed whitespace-pre-wrap">
        {isExpanded || !needsTruncation
          ? content
          : `${content.slice(0, previewLength)}...`}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          {needsTruncation && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onPlay && (
            <button
              onClick={onPlay}
              className="flex items-center justify-center h-10 px-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
            >
              Practice
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center justify-center h-10 w-10 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              aria-label="Delete card"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
