'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';

interface Node {
  id: string;
  title: string;
  type: 'section' | 'subsection';
  parentId: string | null;
  description: string;
  purpose: string;
  n_pages: number;
  should_split: boolean;
}

interface CreateNodeFormProps {
  projectId: string;
  nodes: Node[];
  onSuccess?: () => void;
  type?: 'section' | 'subsection';
  parentId?: string | null;
  onCancel?: () => void;
  initialTitle?: string;
  skipModal?: boolean;
}

export function CreateNodeForm({ 
  projectId, 
  onSuccess,
  type = 'section',
  parentId = null,
  onCancel,
  initialTitle = `New ${type}`,
  skipModal = false
}: CreateNodeFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [n_pages, setNPages] = useState(1);
  const [should_split, setShouldSplit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const createNode = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${projectId}/nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          type,
          parentId,
          description,
          purpose,
          n_pages,
          should_split,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create ${type}`);
      }

      setTitle(initialTitle);
      onSuccess?.();
      onCancel?.();
    } catch (error) {
      setError(`Failed to create ${type}. Please try again.`);
      console.error(`Error creating ${type}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createNode();
  };

  if (skipModal) {
    return (
      <Button
        onClick={createNode}
        className="w-full"
      >
        Add Section
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            {type === 'section' ? 'Section Title' : 'Subsection Title'}
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={`Enter ${type} title`}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter description"
            rows={3}
            required
          />
        </div>

        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
            Purpose
          </label>
          <textarea
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter purpose"
            rows={2}
            required
          />
        </div>

        <div>
          <label htmlFor="n_pages" className="block text-sm font-medium text-gray-700">
            Number of Pages
          </label>
          <input
            type="number"
            id="n_pages"
            value={n_pages}
            onChange={(e) => setNPages(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            min="0"
            step="0.5"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="should_split"
            checked={should_split}
            onChange={(e) => setShouldSplit(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="should_split" className="ml-2 block text-sm text-gray-700">
            Should Split
          </label>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 justify-center"
        >
          {isLoading ? 'Creating...' : `Create ${type === 'section' ? 'Section' : 'Subsection'}`}
        </Button>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 justify-center"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}