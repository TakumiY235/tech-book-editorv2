import { CreateProjectForm } from '../../../components/projects/forms/create-project-form';

export default function NewProjectPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
      <div className="max-w-md">
        <CreateProjectForm />
      </div>
    </div>
  );
}