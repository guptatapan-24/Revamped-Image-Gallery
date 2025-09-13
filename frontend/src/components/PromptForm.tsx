// src/components/ui/PromptForm.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PromptFormProps {
  placeholder?: string;
  onSubmit: (prompt: string) => void | Promise<void>;
  initialPrompt?: string;
  disabled?: boolean;
}

export const PromptForm: React.FC<PromptFormProps> = ({
  placeholder = "Enter your prompt...",
  onSubmit,
  initialPrompt = "",
  disabled = false,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Prompt cannot be empty");
      return;
    }
    setError(null);
    try {
      await onSubmit(prompt.trim());
      // Optionally clear input after submit:
      // setPrompt("");
    } catch (err) {
      setError("Submission failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-lg mx-auto">
      <Input
        type="text"
        placeholder={placeholder}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={disabled}
        aria-label="Prompt input"
        className="flex-grow"
        autoFocus
      />
      <Button type="submit" variant="default" disabled={disabled}>
        Submit
      </Button>
      {error && <p className="text-destructive text-sm ml-2">{error}</p>}
    </form>
  );
};
