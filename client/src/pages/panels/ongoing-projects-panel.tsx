import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Zap, Users } from 'lucide-react';

interface Project {
  _id: string;
  projectId: string;
  projectName: string;
  clientId: any;
  projectStatus: string;
  priorityLevel: string;
  progress: number;
  stage: string;
  projectLead: any;
  teamMembers: any[];
}

export default function OngoingProjectsPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const ongoingProjects = (data.projects || []).filter(
          (p: Project) => p.projectStatus === 'In Progress' || p.projectStatus === 'On Hold'
        );
        setProjects(ongoingProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load ongoing projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8">Loading ongoing projects...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ongoing Projects</h1>
        <p className="text-muted-foreground">Track active and on-hold projects</p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No ongoing projects at the moment. Create a project and set its status to "In Progress" to see it here!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project._id} className="hover:shadow-lg transition-shadow" data-testid={`card-ongoing-project-${project._id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg" data-testid={`text-project-name-${project._id}`}>
                      {project.projectName}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{project.projectId}</p>
                  </div>
                  <Badge className={getStatusColor(project.projectStatus)} data-testid={`badge-status-${project._id}`}>
                    {project.projectStatus}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Priority & Stage */}
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(project.priorityLevel)} data-testid={`badge-priority-${project._id}`}>
                    {project.priorityLevel}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{project.stage}</span>
                </div>

                {/* Client Info */}
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-medium" data-testid={`text-client-${project._id}`}>
                    {project.clientId?.companyName || 'N/A'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <p className="text-muted-foreground">Progress</p>
                    <p className="font-semibold" data-testid={`text-progress-${project._id}`}>
                      {project.progress}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                      data-testid={`progress-bar-${project._id}`}
                    />
                  </div>
                </div>

                {/* Team Members */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Team</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium" data-testid={`text-project-lead-${project._id}`}>
                      🔹 {project.projectLead?.name || 'Lead not assigned'}
                    </p>
                    {project.teamMembers?.length > 0 ? (
                      <div className="space-y-1">
                        {project.teamMembers.map((member, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground" data-testid={`text-team-member-${project._id}-${idx}`}>
                            • {member.userId?.name || 'N/A'} ({member.role})
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No team members assigned</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Total Projects</p>
                <p className="text-2xl font-bold" data-testid="stat-total-projects">
                  {projects.length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Avg Progress</p>
                <p className="text-2xl font-bold" data-testid="stat-avg-progress">
                  {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Critical Priority</p>
                <p className="text-2xl font-bold text-red-600" data-testid="stat-critical-count">
                  {projects.filter(p => p.priorityLevel === 'Critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
