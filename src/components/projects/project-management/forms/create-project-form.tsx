'use client';

import { useState } from 'react';
import { useProjectCreation } from '@app/projects/new/page';
import { Button } from '@/components/ui/button';

export function CreateProjectForm() {
  const [name, setName] = useState('');
  const { createProject } = useProjectCreation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject(name);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Project Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter project name"
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full justify-center"
      >
        Create Project
      </Button>
    </form>
  );
}