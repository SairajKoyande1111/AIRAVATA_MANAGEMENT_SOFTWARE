import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChevronDown, Plus, Trash2, Edit2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ProjectTask {
  _id?: string;
  taskName: string;
  assignedTo: string;
  taskDescription: string;
  taskPriority: 'Low' | 'Medium' | 'High' | 'Critical';
  startDate: string;
  dueDate: string;
  taskStatus: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  comments: string;
}

interface Milestone {
  _id?: string;
  milestoneName: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  notes: string;
}

interface Project {
  _id: string;
  projectId: string;
  projectName: string;
  clientId: any;
  clientContactPerson: string;
  clientMobileNumber: string;
  clientEmail: string;
  projectType: string;
  projectDescription: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  projectDuration?: number;
  projectStatus: string;
  priorityLevel: string;
  progress: number;
  stage: string;
  projectLead: any;
  teamMembers: any[];
  tasks: ProjectTask[];
  milestones: Milestone[];
  meetingNotes: string;
  clientFeedback: string;
  internalNotes: string;
  nextActionDate?: string;
  financial?: any;
  technicalDetails?: any;
  deployment?: any;
  finalRemarks: string;
  clientApproval: boolean;
  projectRating?: number;
}

export default function ProjectsPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    projectName: '',
    clientId: '',
    clientContactPerson: '',
    clientMobileNumber: '',
    clientEmail: '',
    projectType: '',
    projectDescription: '',
    startDate: '',
    expectedEndDate: '',
    priorityLevel: 'Medium',
    stage: 'Requirement Gathering',
  });

  const token = localStorage.getItem('token');

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Project created successfully');
        setFormData({
          projectName: '',
          clientId: '',
          clientContactPerson: '',
          clientMobileNumber: '',
          clientEmail: '',
          projectType: '',
          projectDescription: '',
          startDate: '',
          expectedEndDate: '',
          priorityLevel: 'Medium',
          stage: 'Requirement Gathering',
        });
        setShowForm(false);
        await fetchProjects();
      } else {
        const error = await response.json();
        toast.error(error.error);
      }
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Project deleted');
        await fetchProjects();
      }
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  if (loading) {
    return <div className="p-8">Loading projects...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage all project details and tracking</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} data-testid="button-create-project">
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Project Name"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  required
                  data-testid="input-project-name"
                />
                <Input
                  placeholder="Client ID"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                  data-testid="input-client-id"
                />
                <Input
                  placeholder="Contact Person"
                  value={formData.clientContactPerson}
                  onChange={(e) => setFormData({ ...formData, clientContactPerson: e.target.value })}
                  required
                  data-testid="input-contact-person"
                />
                <Input
                  placeholder="Mobile Number"
                  value={formData.clientMobileNumber}
                  onChange={(e) => setFormData({ ...formData, clientMobileNumber: e.target.value })}
                  required
                  data-testid="input-mobile"
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  required
                  data-testid="input-email"
                />
                <Input
                  placeholder="Project Type"
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  required
                  data-testid="input-project-type"
                />
                <Input
                  placeholder="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  data-testid="input-start-date"
                />
                <Input
                  placeholder="Expected End Date"
                  type="date"
                  value={formData.expectedEndDate}
                  onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
                  required
                  data-testid="input-end-date"
                />
                <Select value={formData.priorityLevel} onValueChange={(val) => setFormData({ ...formData, priorityLevel: val })}>
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={formData.stage} onValueChange={(val) => setFormData({ ...formData, stage: val })}>
                  <SelectTrigger data-testid="select-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Requirement Gathering">Requirement Gathering</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Testing">Testing</SelectItem>
                    <SelectItem value="Deployment">Deployment</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Project Description"
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                data-testid="textarea-description"
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} data-testid="button-submit-project">
                  Create Project
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No projects yet. Create one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project._id} data-testid={`card-project-${project._id}`}>
              <Collapsible defaultOpen={false}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold" data-testid={`text-project-name-${project._id}`}>
                          {project.projectName}
                        </h3>
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">{project.projectId}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{project.projectType}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProject(project._id)}
                        data-testid={`button-delete-project-${project._id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <CollapsibleTrigger asChild>
                        <Button size="sm" variant="outline">
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="space-y-6 border-t pt-6">
                    {/* Basic Details */}
                    <div>
                      <h4 className="font-semibold mb-3">Basic Details</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Client</p>
                          <p className="font-medium" data-testid={`text-client-${project._id}`}>{project.clientId?.companyName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Contact</p>
                          <p className="font-medium">{project.clientContactPerson}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium">{project.clientEmail}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Mobile</p>
                          <p className="font-medium">{project.clientMobileNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="font-semibold mb-3">Timeline</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p className="font-medium">{new Date(project.startDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expected End</p>
                          <p className="font-medium">{new Date(project.expectedEndDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{project.projectDuration} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Stage</p>
                          <p className="font-medium" data-testid={`text-stage-${project._id}`}>{project.stage}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status & Priority */}
                    <div>
                      <h4 className="font-semibold mb-3">Status & Priority</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-medium" data-testid={`text-status-${project._id}`}>{project.projectStatus}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Priority</p>
                          <p className="font-medium" data-testid={`text-priority-${project._id}`}>{project.priorityLevel}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground mb-1">Progress</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${project.progress}%` }}
                              data-testid={`progress-bar-${project._id}`}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{project.progress}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {project.projectDescription && (
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">{project.projectDescription}</p>
                      </div>
                    )}

                    {/* Tasks */}
                    {project.tasks && project.tasks.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Tasks ({project.tasks.length})</h4>
                        <div className="space-y-2">
                          {project.tasks.map((task, idx) => (
                            <div key={idx} className="p-3 bg-muted rounded text-sm" data-testid={`task-${project._id}-${idx}`}>
                              <p className="font-medium">{task.taskName}</p>
                              <p className="text-xs text-muted-foreground">Status: {task.taskStatus} | Priority: {task.taskPriority}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Milestones */}
                    {project.milestones && project.milestones.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Milestones ({project.milestones.length})</h4>
                        <div className="space-y-2">
                          {project.milestones.map((milestone, idx) => (
                            <div key={idx} className="p-3 bg-muted rounded text-sm" data-testid={`milestone-${project._id}-${idx}`}>
                              <p className="font-medium">{milestone.milestoneName}</p>
                              <p className="text-xs text-muted-foreground">Due: {new Date(milestone.dueDate).toLocaleDateString('en-IN')} | Status: {milestone.status}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
