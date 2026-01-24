"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TeleprompterProps {
  content: string;
  onClose: () => void;
}

export function Teleprompter({ content, onClose }: TeleprompterProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [wpm, setWpm] = useState(120);
  const [fontSize, setFontSize] = useState(28);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const words = content.split(/(\s+)/).filter((w) => w.length > 0);
  const wordOnlyIndices = words
    .map((w, i) => (/\S/.test(w) ? i : -1))
    .filter((i) => i !== -1);

  const msPerWord = Math.round(60000 / wpm);

  const startPlayback = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const currentWordPosition = wordOnlyIndices.indexOf(prev);
        const nextPosition = currentWordPosition + 1;

        if (nextPosition >= wordOnlyIndices.length) {
          setIsPlaying(false);
          return prev;
        }

        return wordOnlyIndices[nextPosition];
      });
    }, msPerWord);
  }, [msPerWord, wordOnlyIndices]);

  useEffect(() => {
    if (isPlaying) {
      if (currentIndex === -1) {
        setCurrentIndex(wordOnlyIndices[0] ?? 0);
      }
      startPlayback();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, startPlayback, currentIndex, wordOnlyIndices]);

  useEffect(() => {
    if (currentIndex >= 0 && wordRefs.current[currentIndex]) {
      wordRefs.current[currentIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentIndex]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const reset = () => {
    setIsPlaying(false);
    setCurrentIndex(-1);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
          e.preventDefault();
          setIsPlaying((p) => !p);
          break;
        case "Escape":
          if (isFullscreen) {
            document.exitFullscreen();
          } else {
            onClose();
          }
          break;
        case "ArrowUp":
          setWpm((w) => Math.min(w + 10, 300));
          break;
        case "ArrowDown":
          setWpm((w) => Math.max(w - 10, 30));
          break;
        case "ArrowLeft":
          setCurrentIndex((prev) => {
            const pos = wordOnlyIndices.indexOf(prev);
            return pos > 0 ? wordOnlyIndices[pos - 1] : prev;
          });
          break;
        case "ArrowRight":
          setCurrentIndex((prev) => {
            const pos = wordOnlyIndices.indexOf(prev);
            return pos < wordOnlyIndices.length - 1
              ? wordOnlyIndices[pos + 1]
              : prev;
          });
          break;
        case "r":
          reset();
          break;
      }
    },
    [isFullscreen, onClose, wordOnlyIndices]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const getWordStyle = (index: number): string => {
    const isWhitespace = !/\S/.test(words[index]);
    if (isWhitespace) return "";

    const wordPosition = wordOnlyIndices.indexOf(index);
    const currentPosition = wordOnlyIndices.indexOf(currentIndex);

    if (index === currentIndex) {
      return "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-semibold scale-105 inline-block transition-all duration-150";
    } else if (currentPosition >= 0 && wordPosition < currentPosition) {
      return "text-muted/60 transition-colors duration-300";
    } else {
      return "text-foreground/80 transition-colors duration-300";
    }
  };

  const progress =
    wordOnlyIndices.length > 0
      ? ((wordOnlyIndices.indexOf(currentIndex) + 1) / wordOnlyIndices.length) * 100
      : 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setFontSize((s) => Math.max(s - 4, 16))} className="h-10 w-10 flex items-center justify-center text-muted hover:text-foreground hover:bg-border/50 rounded-lg transition-colors">A-</button>
            <span className="text-sm text-muted w-8 text-center">{fontSize}</span>
            <button onClick={() => setFontSize((s) => Math.min(s + 4, 56))} className="h-10 w-10 flex items-center justify-center text-muted hover:text-foreground hover:bg-border/50 rounded-lg transition-colors">A+</button>
          </div>

          <button onClick={toggleFullscreen} className="h-10 w-10 flex items-center justify-center text-muted hover:text-foreground hover:bg-border/50 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isFullscreen ? (
                <>
                  <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                  <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                  <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                  <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                </>
              ) : (
                <>
                  <path d="M3 8V5a2 2 0 0 1 2-2h3" />
                  <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                  <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
                  <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className="h-1 bg-border">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-12 md:px-12">
        <div className="max-w-3xl mx-auto leading-relaxed" style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}>
          {words.map((word, index) => (
            <span
              key={index}
              ref={(el) => { wordRefs.current[index] = el; }}
              className={getWordStyle(index)}
              onClick={() => {
                if (/\S/.test(word)) {
                  setCurrentIndex(index);
                  setIsPlaying(false);
                }
              }}
              style={{ cursor: /\S/.test(word) ? "pointer" : "default" }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-border bg-background/95 backdrop-blur">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-4">
            <button onClick={reset} className="h-12 w-12 flex items-center justify-center text-muted hover:text-foreground hover:bg-border/50 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>

            <button onClick={() => setIsPlaying(!isPlaying)} className="h-14 w-14 flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white rounded-full transition-opacity">
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <div className="w-12" />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted w-16">Pace</span>
            <input type="range" min="30" max="300" value={wpm} onChange={(e) => setWpm(Number(e.target.value))} className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer accent-purple-500" />
            <span className="text-sm text-muted w-20 text-right">{wpm} wpm</span>
          </div>

          <p className="text-xs text-muted text-center">
            Space: play/pause · Arrows: adjust pace/navigate · Click word to jump · R: reset
          </p>
        </div>
      </div>
    </div>
  );
}
