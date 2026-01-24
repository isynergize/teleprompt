"use client";

import { useState } from "react";
import { Card, ContentInput, Teleprompter } from "@/components";

interface ContentCard {
  id: string;
  content: string;
}

export default function Home() {
  const [cards, setCards] = useState<ContentCard[]>([]);
  const [showInput, setShowInput] = useState(true);
  const [activeCard, setActiveCard] = useState<ContentCard | null>(null);

  const addCard = (content: string) => {
    const newCard: ContentCard = {
      id: crypto.randomUUID(),
      content,
    };
    setCards((prev) => [newCard, ...prev]);
    setShowInput(false);
  };

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  if (activeCard) {
    return (
      <Teleprompter
        content={activeCard.content}
        onClose={() => setActiveCard(null)}
      />
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Teleprompt</h1>
            <p className="text-sm text-muted">Memorize anything</p>
          </div>
          {!showInput && cards.length > 0 && (
            <button
              onClick={() => setShowInput(true)}
              className="h-10 px-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
            >
              + New
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {showInput && (
            <div className="space-y-4">
              <ContentInput onSubmit={addCard} />
              {cards.length > 0 && (
                <button
                  onClick={() => setShowInput(false)}
                  className="w-full text-sm text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          )}

          {cards.length === 0 && !showInput && (
            <div className="text-center py-12 space-y-4">
              <p className="text-muted">No cards yet</p>
              <button
                onClick={() => setShowInput(true)}
                className="text-accent hover:text-accent-hover transition-colors"
              >
                Add your first card
              </button>
            </div>
          )}

          {cards.length > 0 && (
            <div className="space-y-4">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  content={card.content}
                  onDelete={() => deleteCard(card.id)}
                  onPlay={() => setActiveCard(card)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
