'use client';

import { useEffect } from 'react';
import { useAuth, useProjects, useNavigation } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, FolderKanban, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export function DocumentsView() {
  const { token } = useAuth();
  const { projects, setProjects } = useProjects();
  const { navigate, selectProject } = useNavigation();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.data?.projects) setProjects(data.data.projects);
      } catch {}
    };
    if (token) fetch();
  }, [token, setProjects]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary" /> Documents
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse all documents across your projects
        </p>
      </div>

      {projects.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No documents yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create a project first to generate documents.</p>
            <Button onClick={() => navigate('project-create')} className="gap-2">
              <FolderKanban className="w-4 h-4" /> Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold line-clamp-1">{project.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">{project.documentsCount || 0}</Badge>
                </div>
                <CardDescription className="text-xs">{project.domain}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      selectProject(project.id);
                      navigate('project-detail');
                    }}
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
