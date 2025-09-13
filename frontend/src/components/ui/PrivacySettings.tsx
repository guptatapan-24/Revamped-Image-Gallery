// src/components/ui/PrivacySettings.tsx
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Assuming you have these
import { Label } from "@/components/ui/label";

interface PrivacySettingsProps {
  value: "public" | "unlisted" | "private";
  onChange: (value: "public" | "unlisted" | "private") => void;
  disabled?: boolean;
}

const privacyOptions = [
  {
    id: "public",
    label: "Public",
    description: "Visible to everyone and searchable publicly.",
  },
  {
    id: "unlisted",
    label: "Unlisted",
    description: "Only accessible via direct link; not searchable.",
  },
  {
    id: "private",
    label: "Private",
    description: "Only visible to you and authorized users.",
  },
];

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <RadioGroup value={value} onValueChange={onChange} disabled={disabled} className="flex flex-col gap-4">
      {privacyOptions.map((option) => (
        <div key={option.id} className="flex items-center space-x-3">
          <RadioGroupItem value={option.id} id={`privacy-${option.id}`} />
          <div>
            <Label htmlFor={`privacy-${option.id}`} className="cursor-pointer font-medium text-foreground">
              {option.label}
            </Label>
            <p className="text-sm text-muted-foreground">{option.description}</p>
          </div>
        </div>
      ))}
    </RadioGroup>
  );
};
