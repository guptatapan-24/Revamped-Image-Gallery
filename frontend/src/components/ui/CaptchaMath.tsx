// src/components/ui/CaptchaMath.tsx
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CaptchaMathProps {
  onVerify: (success: boolean) => void;
  resetSignal?: any; // Optional prop to reset the captcha externally
}

export const CaptchaMath: React.FC<CaptchaMathProps> = ({ onVerify, resetSignal }) => {
  const [num1, setNum1] = useState<number>(0);
  const [num2, setNum2] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateQuestion = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setNum1(a);
    setNum2(b);
    setUserAnswer("");
    setError(null);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  // Reset on external trigger (optional)
  useEffect(() => {
    if (resetSignal) {
      generateQuestion();
    }
  }, [resetSignal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const answer = parseInt(userAnswer.trim(), 10);
    if (isNaN(answer)) {
      setError("Please enter a valid number.");
      return;
    }
    if (answer === num1 + num2) {
      setError(null);
      onVerify(true);
      generateQuestion();
    } else {
      setError("Incorrect answer. Please try again.");
      onVerify(false);
      setUserAnswer("");
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2 max-w-xs">
      <label htmlFor="captcha-input" className="text-sm font-medium text-foreground">
        What is {num1} + {num2}?
      </label>
      <Input
        id="captcha-input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        ref={inputRef}
        aria-invalid={!!error}
        aria-describedby="captcha-error"
        autoComplete="off"
        required
        className="w-full"
      />
      {error && (
        <p id="captcha-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" variant="default" size="sm">
        Verify
      </Button>
    </form>
  );
};
