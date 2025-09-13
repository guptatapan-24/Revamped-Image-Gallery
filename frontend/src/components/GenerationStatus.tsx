// src/components/ui/GenerationStatus.tsx
import React from "react";

interface GenerationStatusProps {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
}

export const GenerationStatus: React.FC<GenerationStatusProps> = ({
  status,
  message,
}) => {
  let content = null;
  const baseClass = "text-sm font-medium";

  switch (status) {
    case "idle":
      content = <p className={`${baseClass} text-muted-foreground`}>Enter a prompt to generate an image.</p>;
      break;
    case "loading":
      content = <p className={`${baseClass} text-accent`}>Generating image, please wait...</p>;
      break;
    case "success":
      content = (
        <p className={`${baseClass} text-success`}>
          Image generated successfully{message ? `: ${message}` : "."}
        </p>
      );
      break;
    case "error":
      content = (
        <p className={`${baseClass} text-destructive`}>
          {message || "Failed to generate image. Please try again."}
        </p>
      );
      break;
    default:
      content = null;
  }

  return <div className="p-2">{content}</div>;
};
