'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link';

interface ProjectCardProps {
  id: string;
  name: string;
  userName: string;
}

export function ProjectCard({ id, name, userName }: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`} className="block">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Created by {userName || 'Unknown'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}