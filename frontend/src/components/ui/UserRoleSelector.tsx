// src/components/ui/UserRoleSelector.tsx
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Assuming you have these
import { Label } from "@/components/ui/label";

interface UserRoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const roles = [
  { id: "admin", label: "Admin", description: "Full access, manage users and site settings" },
  { id: "editor", label: "Editor", description: "Can edit content, moderate comments" },
  { id: "visitor", label: "Visitor", description: "Can browse public galleries" },
];

export const UserRoleSelector: React.FC<UserRoleSelectorProps> = ({ value, onChange, disabled }) => {
  return (
    <RadioGroup value={value} onValueChange={onChange} disabled={disabled} className="flex flex-col gap-4">
      {roles.map((role) => (
        <div key={role.id} className="flex items-center space-x-3">
          <RadioGroupItem value={role.id} id={`role-${role.id}`} />
          <div>
            <Label htmlFor={`role-${role.id}`} className="font-medium text-foreground cursor-pointer">
              {role.label}
            </Label>
            <p className="text-sm text-muted-foreground">{role.description}</p>
          </div>
        </div>
      ))}
    </RadioGroup>
  );
};
