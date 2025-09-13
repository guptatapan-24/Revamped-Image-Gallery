// src/components/ui/ColorPicker.tsx
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  color,
  onChange,
  disabled = false,
}) => {
  const [internalColor, setInternalColor] = useState(color);

  useEffect(() => {
    setInternalColor(color);
  }, [color]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalColor(val);
    onChange(val);
  };

  return (
    <div className="flex items-center space-x-4 max-w-xs">
      <label htmlFor={`color-picker-${label}`} className="font-medium text-foreground w-24">
        {label}
      </label>
      <input
        id={`color-picker-${label}`}
        type="color"
        value={internalColor}
        onChange={handleInputChange}
        disabled={disabled}
        className="cursor-pointer w-10 h-10 p-0 border border-border rounded"
        aria-label={`${label} color picker`}
      />
      <Input
        type="text"
        value={internalColor}
        onChange={(e) => {
          let val = e.target.value;
          if (!val.startsWith("#")) val = "#" + val;
          setInternalColor(val);
          onChange(val);
        }}
        disabled={disabled}
        spellCheck={false}
        maxLength={7}
        className="w-24"
        aria-label={`${label} hex input`}
      />
    </div>
  );
};
