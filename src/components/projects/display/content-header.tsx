'use client';

import { Button } from '../../ui/button';

interface ContentHeaderProps {
  title: string;
  isEditing: boolean;
  onToggleEdit: () => void;
}

export function ContentHeader({ title, isEditing, onToggleEdit }: ContentHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Button
        onClick={onToggleEdit}
        variant="outline"
        size="sm"
      >
        {isEditing ? 'Preview' : 'Edit'}
      </Button>
    </div>
  );
}