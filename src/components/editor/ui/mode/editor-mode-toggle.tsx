'use client';

import React from 'react';
import { Button } from '../common/button';

interface EditorModeToggleProps {
  isEditing: boolean;
  onToggle: () => void;
}

export function EditorModeToggle({ isEditing, onToggle }: EditorModeToggleProps) {
  return (
    <div className="flex justify-end mb-4">
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
      >
        {isEditing ? 'Preview' : 'Edit'}
      </Button>
    </div>
  );
}