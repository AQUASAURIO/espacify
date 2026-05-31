'use client';

import { useEffect } from 'react';
import { useAuth, useProjects, useNavigation } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FolderKanban,
  FileText,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  LayoutDashboard,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export function DashboardView() {
  const { user } = useAuth();
  const { projects, setProjects, isLoading } = useProjects();
  const { navigate, token } = useNavigation();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.data?.projects) {
          setProjects(data.data.projects);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      }
    };
    if (token) fetchProjects();
  }, [token, setProjects]);

  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;
  const draftProjects = projects.filter((p) => p.status === 'DRAFT').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  const stats = [
    { label: 'Total Projects', value: totalProjects, icon: FolderKanban, color: 'text-primary' },
    { label: 'Completed', value: completedProjects, icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'In Progress', value: draftProjects, icon: Clock, color: 'text-amber-600' },
    { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}`, icon: DollarSign, color: 'text-teal-600' },
  ];

  const recentProjects = projects.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your space projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Completion Progress */}
      {totalProjects > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Project Completion</CardTitle>
              <CardDescription>
                {completedProjects} of {totalProjects} projects completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress
                value={(completedProjects / totalProjects) * 100}
                className="h-3"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round((completedProjects / totalProjects) * 100)}% complete
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Recent Projects</h2>
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate('projects')}>
            View All <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {recentProjects.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <FolderKanban className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Create your first space organization project to get started with smart design suggestions.
              </p>
              <Button onClick={() => navigate('project-create')} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project) => (
              <Card
                key={project.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
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
                    <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                      {project.status}
                    </Badge>
                  </div>
                  {project.description && (
                    <CardDescription className="line-clamp-2 text-xs">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {project.documentsCount || 0} docs
                      </span>
                      {project.budget && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${project.budget.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span>{format(new Date(project.updatedAt), 'MMM d')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
