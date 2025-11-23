import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChevronDown, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  tasks: any[];
  milestones: any[];
  meetingNotes: string;
  clientFeedback: string;
  internalNotes: string;
  followUps?: string[];
  nextActionDate?: string;
  uploadedFiles?: string[];
  financial?: any;
  technicalDetails?: any;
  deployment?: any;
  finalRemarks?: string;
  clientApproval?: boolean;
  handoverFiles?: string[];
  projectRating?: number;
}

export default function ProjectsPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<{ projectId: string; section: string } | null>(null);

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

  const handleUpdateProject = async (projectId: string, updateData: any) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast.success('Project updated successfully');
        await fetchProjects();
        setEditingSection(null);
      } else {
        const error = await response.json();
        toast.error(error.error);
      }
    } catch (error) {
      toast.error('Failed to update project');
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

  const handleAddTask = async (projectId: string, task: any) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (response.ok) {
        toast.success('Task added successfully');
        await fetchProjects();
      }
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const handleAddMilestone = async (projectId: string, milestone: any) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(milestone),
      });

      if (response.ok) {
        toast.success('Milestone added successfully');
        await fetchProjects();
      }
    } catch (error) {
      toast.error('Failed to add milestone');
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
              <Collapsible open={expandedProject === project._id} onOpenChange={(open) => setExpandedProject(open ? project._id : null)}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold" data-testid={`text-project-name-${project._id}`}>
                          {project.projectName}
                        </h3>
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">{project.projectId}</span>
                        <span className={`text-xs px-2 py-1 rounded ${project.projectStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {project.projectStatus}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {project.projectType} • {project.priorityLevel} Priority
                      </p>
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
                    {/* 1. Basic Project Details */}
                    <Section title="Basic Project Details" projectId={project._id} section="basic">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Project ID</p>
                          <p className="font-medium" data-testid={`text-project-id-${project._id}`}>{project.projectId}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Project Name</p>
                          <p className="font-medium">{project.projectName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Client</p>
                          <p className="font-medium">{project.clientId?.companyName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Contact Person</p>
                          <p className="font-medium">{project.clientContactPerson}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Mobile</p>
                          <p className="font-medium">{project.clientMobileNumber}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium">{project.clientEmail}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium">{project.projectType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Description</p>
                          <p className="font-medium">{project.projectDescription || 'N/A'}</p>
                        </div>
                      </div>
                    </Section>

                    {/* 2. Project Timeline */}
                    <Section title="Project Timeline" projectId={project._id} section="timeline">
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p className="font-medium">{new Date(project.startDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expected End</p>
                          <p className="font-medium">{new Date(project.expectedEndDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Actual End</p>
                          <p className="font-medium">{project.actualEndDate ? new Date(project.actualEndDate).toLocaleDateString('en-IN') : 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{project.projectDuration || '—'} days</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Milestones ({project.milestones?.length || 0})</h4>
                        {project.milestones?.length > 0 ? (
                          <div className="space-y-2">
                            {project.milestones.map((m, idx) => (
                              <div key={idx} className="p-2 bg-muted rounded text-sm" data-testid={`milestone-${project._id}-${idx}`}>
                                <p className="font-medium">{m.milestoneName}</p>
                                <p className="text-xs text-muted-foreground">Due: {new Date(m.dueDate).toLocaleDateString('en-IN')} | {m.status}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No milestones added</p>
                        )}
                      </div>
                    </Section>

                    {/* 3. Project Status & Priority */}
                    <Section title="Project Status & Priority" projectId={project._id} section="status">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-medium">{project.projectStatus}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Priority</p>
                          <p className="font-medium">{project.priorityLevel}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Stage</p>
                          <p className="font-medium">{project.stage}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Progress</p>
                          <p className="font-medium">{project.progress}%</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }} />
                        </div>
                      </div>
                    </Section>

                    {/* 4. Team Assignment */}
                    <Section title="Team Assignment" projectId={project._id} section="team">
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Project Lead</p>
                          <p className="font-medium">{project.projectLead?.name || 'Not assigned'}</p>
                        </div>
                        {project.teamMembers?.length > 0 && (
                          <div>
                            <p className="text-muted-foreground mb-2">Team Members</p>
                            <div className="space-y-1">
                              {project.teamMembers.map((m, idx) => (
                                <div key={idx} className="p-2 bg-muted rounded text-xs">
                                  <p className="font-medium">{m.userId?.name || 'N/A'} - {m.role}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Section>

                    {/* 5. Tasks / Subtasks */}
                    <Section title="Tasks & Subtasks" projectId={project._id} section="tasks">
                      {project.tasks?.length > 0 ? (
                        <div className="space-y-2">
                          {project.tasks.map((t, idx) => (
                            <div key={idx} className="p-3 bg-muted rounded text-sm" data-testid={`task-${project._id}-${idx}`}>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium">{t.taskName}</p>
                                  <p className="text-xs text-muted-foreground">{t.taskDescription}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Status: {t.taskStatus} | Priority: {t.taskPriority}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No tasks added</p>
                      )}
                    </Section>

                    {/* 6. Communication & Notes */}
                    <Section title="Communication & Notes" projectId={project._id} section="communication">
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-muted-foreground font-semibold">Meeting Notes</p>
                          <p className="font-medium">{project.meetingNotes || 'None'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-semibold">Client Feedback</p>
                          <p className="font-medium">{project.clientFeedback || 'None'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-semibold">Internal Notes</p>
                          <p className="font-medium">{project.internalNotes || 'None'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-semibold">Next Action Date</p>
                          <p className="font-medium">{project.nextActionDate ? new Date(project.nextActionDate).toLocaleDateString('en-IN') : 'Not set'}</p>
                        </div>
                      </div>
                    </Section>

                    {/* 7. Financial Section */}
                    <Section title="Financial Section" projectId={project._id} section="financial">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Estimated Cost</p>
                          <p className="font-medium">₹{project.financial?.estimatedCost || '0'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Amount Quoted</p>
                          <p className="font-medium">₹{project.financial?.amountQuoted || '0'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Amount Received</p>
                          <p className="font-medium">₹{project.financial?.amountReceived || '0'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Payment Status</p>
                          <p className="font-medium">{project.financial?.paymentStatus || 'Pending'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Invoice Details</p>
                          <p className="font-medium">{project.financial?.invoiceDetails || 'None'}</p>
                        </div>
                      </div>
                    </Section>

                    {/* 8. Technical Details */}
                    <Section title="Technical Details" projectId={project._id} section="technical">
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Technology Stack</p>
                          <p className="font-medium">{project.technicalDetails?.technologyStack?.join(', ') || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Hosting</p>
                          <p className="font-medium">{project.technicalDetails?.hostingDetails || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Domain</p>
                          <p className="font-medium">{project.technicalDetails?.domainDetails || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Credentials</p>
                          <p className="font-medium">{project.technicalDetails?.credentials ? '✓ Stored' : 'None'}</p>
                        </div>
                      </div>
                    </Section>

                    {/* 9. Deployment / Delivery */}
                    <Section title="Deployment & Delivery" projectId={project._id} section="deployment">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-medium">{project.deployment?.deploymentStatus || 'Not Started'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">{project.deployment?.deploymentDate ? new Date(project.deployment.deploymentDate).toLocaleDateString('en-IN') : 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Go-Live</p>
                          <p className="font-medium">{project.deployment?.goLiveConfirmation ? '✓ Confirmed' : 'Pending'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Maintenance</p>
                          <p className="font-medium">{project.deployment?.maintenancePeriod || 'Not specified'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">UAT Notes</p>
                          <p className="font-medium">{project.deployment?.uatNotes || 'None'}</p>
                        </div>
                      </div>
                    </Section>

                    {/* 10. Completion Summary */}
                    <Section title="Completion Summary" projectId={project._id} section="completion">
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Final Remarks</p>
                          <p className="font-medium">{project.finalRemarks || 'None'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Client Approval</p>
                          <p className="font-medium">{project.clientApproval ? '✓ Approved' : 'Pending'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Project Rating</p>
                          <p className="font-medium">{project.projectRating ? `${project.projectRating}/5` : 'Not rated'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Handover Files</p>
                          <p className="font-medium">{project.handoverFiles?.length || 0} file(s)</p>
                        </div>
                      </div>
                    </Section>
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

function Section({ title, projectId, section, children }: { title: string; projectId: string; section: string; children: React.ReactNode }) {
  return (
    <Collapsible defaultOpen>
      <div className="flex justify-between items-center">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 hover:opacity-70">
            <h4 className="font-semibold">{title}</h4>
            <ChevronDown className="w-4 h-4" />
          </button>
        </CollapsibleTrigger>
        <Button size="sm" variant="ghost" data-testid={`button-edit-${section}-${projectId}`}>
          <Edit2 className="w-4 h-4" />
        </Button>
      </div>
      <CollapsibleContent className="mt-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
