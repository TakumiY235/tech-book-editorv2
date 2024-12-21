import { prisma } from '@/services/prisma/db'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/projects/display/project-card'
import Link from 'next/link';

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      user: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <Link href="/projects/new">
          <Button>New Project</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            id={project.id}
            name={project.name}
            userName={project.user?.name || 'Unknown'}
          />
        ))}
      </div>
    </div>
  );
}