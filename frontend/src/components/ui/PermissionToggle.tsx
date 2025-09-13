// src/components/ui/PermissionToggle.tsx
import React from "react";
import { Switch } from "@/components/ui/switch"; // Assuming you have a Switch component
import { Label } from "@/components/ui/label";

interface PermissionToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const PermissionToggle: React.FC<PermissionToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between rounded-md border border-input bg-background p-4 shadow-soft">
      <div>
        <Label className="mb-1 font-medium text-foreground">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  );
};
