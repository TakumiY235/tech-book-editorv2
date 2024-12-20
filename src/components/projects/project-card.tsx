'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProjectCardProps {
  id: string;
  name: string;
  userName: string;
}

export function ProjectCard({ id, name, userName }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    setShowConfirmation(true);
  };

  const confirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      router.refresh(); // Refresh the page to update the project list
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    setShowConfirmation(false);
  };

  return (
    <Link href={`/projects/${id}`} className="block relative">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{name}</CardTitle>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-2 right-2"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Created by {userName || 'Unknown'}
          </p>
        </CardContent>
      </Card>
      
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelDelete}>
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Delete Project</h3>
            <p className="mb-6">Are you sure you want to delete &quot;{name}&quot;? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={cancelDelete} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}