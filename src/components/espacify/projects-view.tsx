'use client';

import { useEffect, useState } from 'react';
import { useAuth, useProjects, useNavigation } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  FolderKanban,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  FileText,
  DollarSign,
  ArrowUpDown,
  LayoutGrid,
  List,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type StatusFilter = 'ALL' | 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'VALIDATED';
type SortBy = 'updatedAt' | 'createdAt' | 'name' | 'budget';
type ViewMode = 'grid' | 'list';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  GENERATING: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  VALIDATED: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
};

export function ProjectsView() {
  const { user, token } = useAuth();
  const { projects, setProjects, addProject, updateProject, removeProject } = useProjects();
  const { navigate } = useNavigation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('updatedAt');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editProject, setEditProject] = useState<null | { id: string; name: string; description: string; budget: number | null; status: string; domain: string }>(null);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.data?.projects) setProjects(data.data.projects);
    } catch {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchProjects(); }, [token, setProjects]);

  const filtered = projects
    .filter((p) => statusFilter === 'ALL' || p.status === statusFilter)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'budget') return (b.budget || 0) - (a.budget || 0);
      return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
    });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/projects/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      removeProject(deleteId);
      toast.success('Project deleted');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleEdit = async () => {
    if (!editProject) return;
    try {
      const res = await fetch(`/api/projects/${editProject.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editProject.name,
          description: editProject.description,
          budget: editProject.budget,
          status: editProject.status,
          domain: editProject.domain,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Update failed');
      updateProject(editProject.id, data.data.project);
      toast.success('Project updated');
      setEditProject(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update project');
    }
  };

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'GENERATING', label: 'Generating' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'VALIDATED', label: 'Validated' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your space organization projects
          </p>
        </div>
        <Button onClick={() => navigate('project-create')} className="gap-2 self-start">
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border bg-muted/50 p-0.5 gap-0.5">
            {statusFilters.map((sf) => (
              <Button
                key={sf.value}
                variant={statusFilter === sf.value ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 text-xs px-3"
                onClick={() => setStatusFilter(sf.value)}
              >
                {sf.label}
              </Button>
            ))}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(['updatedAt', 'createdAt', 'name', 'budget'] as SortBy[]).map((s) => (
                <DropdownMenuItem key={s} onClick={() => setSortBy(s)}>
                  {s === 'updatedAt' ? 'Last Modified' : s === 'createdAt' ? 'Created' : s === 'name' ? 'Name' : 'Budget'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderKanban className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No projects found</h3>
            <p className="text-sm text-muted-foreground">
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'Create your first project to get started'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <Card
              key={project.id}
              className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() => {
                useNavigation.getState().selectProject(project.id);
                navigate('project-detail');
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors line-clamp-1">
                    {project.name}
                  </CardTitle>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge variant="secondary" className={cn('text-xs', statusColors[project.status])}>
                      {project.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => setEditProject({
                          id: project.id, name: project.name, description: project.description || '',
                          budget: project.budget, status: project.status, domain: project.domain,
                        })}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(project.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {project.description && (
                  <CardDescription className="line-clamp-2 text-xs mt-1">
                    {project.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {project.documentsCount || 0}
                    </span>
                    {project.budget != null && project.budget > 0 && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> ${project.budget.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span>{format(new Date(project.updatedAt), 'MMM d, yyyy')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="divide-y">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => {
                  useNavigation.getState().selectProject(project.id);
                  navigate('project-detail');
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{project.name}</span>
                    <Badge variant="secondary" className={cn('text-xs', statusColors[project.status])}>
                      {project.status}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{project.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{project.documentsCount || 0}</span>
                  {project.budget != null && project.budget > 0 && (
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${project.budget.toLocaleString()}</span>
                  )}
                  <span className="w-20 text-right">{format(new Date(project.updatedAt), 'MMM d')}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => setEditProject({
                        id: project.id, name: project.name, description: project.description || '',
                        budget: project.budget, status: project.status, domain: project.domain,
                      })}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(project.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All documents and data associated with this project will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={!!editProject} onOpenChange={() => setEditProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update the project details</DialogDescription>
          </DialogHeader>
          {editProject && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={editProject.name} onChange={(e) => setEditProject({ ...editProject, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input value={editProject.description} onChange={(e) => setEditProject({ ...editProject, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Budget</label>
                  <Input type="number" value={editProject.budget || ''} onChange={(e) => setEditProject({ ...editProject, budget: e.target.value ? parseFloat(e.target.value) : null })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Input value={editProject.status} onChange={(e) => setEditProject({ ...editProject, status: e.target.value })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProject(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
