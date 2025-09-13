// src/components/ui/LicenseSelector.tsx
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assuming you have these

interface LicenseSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const licenses = [
  { value: "cc-by", label: "Creative Commons Attribution (CC BY)" },
  { value: "cc-by-sa", label: "Creative Commons ShareAlike (CC BY-SA)" },
  { value: "cc-by-nd", label: "Creative Commons NoDerivatives (CC BY-ND)" },
  { value: "cc-by-nc", label: "Creative Commons NonCommercial (CC BY-NC)" },
  { value: "public-domain", label: "Public Domain" },
  { value: "all-rights-reserved", label: "All Rights Reserved" },
  { value: "custom", label: "Custom License" },
];

export const LicenseSelector: React.FC<LicenseSelectorProps> = ({ value, onChange, disabled = false }) => {
  return (
    <div className="flex flex-col space-y-1">
      <Label htmlFor="license-select" className="text-foreground font-medium">
        License
      </Label>
      <Select
        aria-labelledby="license-label"
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a license" />
        </SelectTrigger>
        <SelectContent>
          {licenses.map((license) => (
            <SelectItem key={license.value} value={license.value}>
              {license.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
