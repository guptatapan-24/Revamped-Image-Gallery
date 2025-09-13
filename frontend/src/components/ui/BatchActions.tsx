// src/components/ui/BatchActions.tsx
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface BatchActionsProps {
  selectedCount: number;
  onDelete: () => void;
  onMoveToAlbum: () => void;
  onEditMetadata: () => void;
  disabled?: boolean;
}

export const BatchActions: React.FC<BatchActionsProps> = ({
  selectedCount,
  onDelete,
  onMoveToAlbum,
  onEditMetadata,
  disabled = false,
}) => {
  return (
    <div className="flex items-center space-x-2 p-4 border border-border rounded-md shadow-sm bg-card">
      <span className="text-sm font-medium text-foreground">
        {selectedCount} selected
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={disabled}>
            Actions
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMoveToAlbum}>Move to Album</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onEditMetadata}>Edit Metadata</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
