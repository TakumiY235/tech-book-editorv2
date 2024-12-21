'use client';

import { useState } from 'react';
import { useProjectCreation } from '../../../hooks/useProjectCreation';

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
      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Create Project
      </button>
    </form>
  );
}