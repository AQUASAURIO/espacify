'use client';

import { useEffect } from 'react';
import { useAuth, useAudit } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, User, Shield, FileText, FolderKanban, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const actionIcons: Record<string, typeof Activity> = {
  USER_REGISTERED: User,
  USER_LOGIN: User,
  PROJECT_CREATED: FolderKanban,
  PROJECT_UPDATED: FolderKanban,
  PROJECT_DELETED: FolderKanban,
  DOCUMENT_CREATED: FileText,
};

const actionColors: Record<string, string> = {
  USER_REGISTERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  USER_LOGIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  PROJECT_CREATED: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
  PROJECT_UPDATED: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  PROJECT_DELETED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  DOCUMENT_CREATED: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

export function AuditView() {
  const { user, token } = useAuth();
  const { entries, setEntries, isLoading } = useAudit();

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await fetch('/api/audit', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.data?.entries) setEntries(data.data.entries);
      } catch {
        console.error('Failed to fetch audit logs');
      }
    };
    if (token) fetchAudit();
  }, [token, setEntries]);

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">Only administrators can view audit logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="w-7 h-7 text-primary" /> Audit Log
        </h1>
        <p className="text-muted-foreground mt-1">
          Track all system operations and user activities
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No audit entries</h3>
            <p className="text-sm text-muted-foreground">Activities will appear here as operations are performed.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px]">
              <div className="divide-y">
                {entries.map((entry) => {
                  const Icon = actionIcons[entry.action] || Activity;
                  return (
                    <div key={entry.id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', actionColors[entry.action] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300')}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{entry.action.replace(/_/g, ' ')}</span>
                          <Badge variant="outline" className="text-xs">{entry.entity}</Badge>
                        </div>
                        {entry.details && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.details}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{entry.userName}</span>
                          {entry.ipAddress && <span>IP: {entry.ipAddress}</span>}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex-shrink-0">
                        {format(new Date(entry.createdAt), 'MMM d, HH:mm:ss')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
