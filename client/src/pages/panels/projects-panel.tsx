import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChevronDown, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const DEFAULT_FORM = {
  projectName: '',
  clientId: '',
  clientContactPerson: '',
  clientMobileNumber: '',
  clientEmail: '',
  projectType: '',
  projectDescription: '',
  startDate: '',
  expectedEndDate: '',
  actualEndDate: '',
  projectStatus: 'Not Started',
  priorityLevel: 'Medium',
  progress: 0,
  stage: 'Requirement Gathering',
  meetingNotes: '',
  clientFeedback: '',
  internalNotes: '',
  nextActionDate: '',
  financial: {
    estimatedCost: 0,
    amountQuoted: 0,
    amountReceived: 0,
    invoiceDetails: '',
    paymentStatus: 'Pending',
  },
  technicalDetails: {
    technologyStack: '',
    hostingDetails: '',
    domainDetails: '',
    credentials: '',
  },
  deployment: {
    deploymentStatus: 'Not Started',
    deploymentDate: '',
    uatNotes: '',
    goLiveConfirmation: false,
    maintenancePeriod: '',
  },
  finalRemarks: '',
  clientApproval: false,
  projectRating: 0,
};

export default function ProjectsPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

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
        setFormData(DEFAULT_FORM);
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
      <Tabs defaultValue="form" className="w-full">
        <TabsList>
          <TabsTrigger value="form">Create Project</TabsTrigger>
          <TabsTrigger value="list">Project List ({projects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="space-y-6">
                {/* 1. Basic Project Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">1. Basic Project Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Project Name *"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      required
                      data-testid="input-project-name"
                    />
                    <Input
                      placeholder="Client ID *"
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      required
                      data-testid="input-client-id"
                    />
                    <Input
                      placeholder="Contact Person *"
                      value={formData.clientContactPerson}
                      onChange={(e) => setFormData({ ...formData, clientContactPerson: e.target.value })}
                      required
                      data-testid="input-contact-person"
                    />
                    <Input
                      placeholder="Mobile Number *"
                      value={formData.clientMobileNumber}
                      onChange={(e) => setFormData({ ...formData, clientMobileNumber: e.target.value })}
                      required
                      data-testid="input-mobile"
                    />
                    <Input
                      placeholder="Email *"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      required
                      data-testid="input-email"
                    />
                    <Input
                      placeholder="Project Type *"
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      required
                      data-testid="input-project-type"
                    />
                  </div>
                  <Textarea
                    placeholder="Project Description"
                    value={formData.projectDescription}
                    onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                    className="mt-4"
                    data-testid="textarea-description"
                  />
                </div>

                {/* 2. Project Timeline */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">2. Project Timeline</h3>
                  <div className="grid grid-cols-2 gap-4">
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
                    <Input
                      placeholder="Actual End Date"
                      type="date"
                      value={formData.actualEndDate}
                      onChange={(e) => setFormData({ ...formData, actualEndDate: e.target.value })}
                      data-testid="input-actual-end-date"
                    />
                  </div>
                </div>

                {/* 3. Project Status & Priority */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">3. Project Status & Priority</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={formData.projectStatus} onValueChange={(val) => setFormData({ ...formData, projectStatus: val })}>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Input
                      placeholder="Progress %"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                      data-testid="input-progress"
                    />
                  </div>
                </div>

                {/* 6. Communication & Notes */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">6. Communication & Notes</h3>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Meeting Notes"
                      value={formData.meetingNotes}
                      onChange={(e) => setFormData({ ...formData, meetingNotes: e.target.value })}
                      data-testid="textarea-meeting-notes"
                    />
                    <Textarea
                      placeholder="Client Feedback"
                      value={formData.clientFeedback}
                      onChange={(e) => setFormData({ ...formData, clientFeedback: e.target.value })}
                      data-testid="textarea-client-feedback"
                    />
                    <Textarea
                      placeholder="Internal Notes"
                      value={formData.internalNotes}
                      onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                      data-testid="textarea-internal-notes"
                    />
                    <Input
                      placeholder="Next Action Date"
                      type="date"
                      value={formData.nextActionDate}
                      onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
                      data-testid="input-next-action-date"
                    />
                  </div>
                </div>

                {/* 7. Financial Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">7. Financial Section</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Estimated Cost"
                      type="number"
                      value={formData.financial.estimatedCost}
                      onChange={(e) => setFormData({
                        ...formData,
                        financial: { ...formData.financial, estimatedCost: parseInt(e.target.value) || 0 }
                      })}
                      data-testid="input-estimated-cost"
                    />
                    <Input
                      placeholder="Amount Quoted"
                      type="number"
                      value={formData.financial.amountQuoted}
                      onChange={(e) => setFormData({
                        ...formData,
                        financial: { ...formData.financial, amountQuoted: parseInt(e.target.value) || 0 }
                      })}
                      data-testid="input-amount-quoted"
                    />
                    <Input
                      placeholder="Amount Received"
                      type="number"
                      value={formData.financial.amountReceived}
                      onChange={(e) => setFormData({
                        ...formData,
                        financial: { ...formData.financial, amountReceived: parseInt(e.target.value) || 0 }
                      })}
                      data-testid="input-amount-received"
                    />
                    <Select value={formData.financial.paymentStatus} onValueChange={(val) => setFormData({
                      ...formData,
                      financial: { ...formData.financial, paymentStatus: val }
                    })}>
                      <SelectTrigger data-testid="select-payment-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Invoice Details"
                      value={formData.financial.invoiceDetails}
                      onChange={(e) => setFormData({
                        ...formData,
                        financial: { ...formData.financial, invoiceDetails: e.target.value }
                      })}
                      className="col-span-2"
                      data-testid="input-invoice-details"
                    />
                  </div>
                </div>

                {/* 8. Technical Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">8. Technical Details</h3>
                  <div className="space-y-4">
                    <Input
                      placeholder="Technology Stack (comma separated)"
                      value={formData.technicalDetails.technologyStack}
                      onChange={(e) => setFormData({
                        ...formData,
                        technicalDetails: { ...formData.technicalDetails, technologyStack: e.target.value }
                      })}
                      data-testid="input-tech-stack"
                    />
                    <Input
                      placeholder="Hosting Details"
                      value={formData.technicalDetails.hostingDetails}
                      onChange={(e) => setFormData({
                        ...formData,
                        technicalDetails: { ...formData.technicalDetails, hostingDetails: e.target.value }
                      })}
                      data-testid="input-hosting"
                    />
                    <Input
                      placeholder="Domain Details"
                      value={formData.technicalDetails.domainDetails}
                      onChange={(e) => setFormData({
                        ...formData,
                        technicalDetails: { ...formData.technicalDetails, domainDetails: e.target.value }
                      })}
                      data-testid="input-domain"
                    />
                    <Input
                      placeholder="Credentials"
                      value={formData.technicalDetails.credentials}
                      onChange={(e) => setFormData({
                        ...formData,
                        technicalDetails: { ...formData.technicalDetails, credentials: e.target.value }
                      })}
                      data-testid="input-credentials"
                    />
                  </div>
                </div>

                {/* 9. Deployment & Delivery */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">9. Deployment & Delivery</h3>
                  <div className="space-y-4">
                    <Select value={formData.deployment.deploymentStatus} onValueChange={(val) => setFormData({
                      ...formData,
                      deployment: { ...formData.deployment, deploymentStatus: val }
                    })}>
                      <SelectTrigger data-testid="select-deployment-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Deployment Date"
                      type="date"
                      value={formData.deployment.deploymentDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        deployment: { ...formData.deployment, deploymentDate: e.target.value }
                      })}
                      data-testid="input-deployment-date"
                    />
                    <Textarea
                      placeholder="UAT Notes"
                      value={formData.deployment.uatNotes}
                      onChange={(e) => setFormData({
                        ...formData,
                        deployment: { ...formData.deployment, uatNotes: e.target.value }
                      })}
                      data-testid="textarea-uat-notes"
                    />
                    <Input
                      placeholder="Maintenance Period"
                      value={formData.deployment.maintenancePeriod}
                      onChange={(e) => setFormData({
                        ...formData,
                        deployment: { ...formData.deployment, maintenancePeriod: e.target.value }
                      })}
                      data-testid="input-maintenance-period"
                    />
                  </div>
                </div>

                {/* 10. Completion Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">10. Completion Summary</h3>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Final Remarks"
                      value={formData.finalRemarks}
                      onChange={(e) => setFormData({ ...formData, finalRemarks: e.target.value })}
                      data-testid="textarea-final-remarks"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.clientApproval}
                        onChange={(e) => setFormData({ ...formData, clientApproval: e.target.checked })}
                        id="client-approval"
                        data-testid="checkbox-client-approval"
                      />
                      <label htmlFor="client-approval">Client Approval / Sign-Off</label>
                    </div>
                    <Input
                      placeholder="Project Rating (1-5)"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.projectRating}
                      onChange={(e) => setFormData({ ...formData, projectRating: parseInt(e.target.value) || 0 })}
                      data-testid="input-rating"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full" data-testid="button-submit-project">
                  Create Project
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No projects yet. Create one using the Create Project tab!</p>
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
                    <CardContent className="space-y-4 border-t pt-6 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">Client</p>
                          <p className="font-medium">{project.clientId?.companyName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Contact</p>
                          <p className="font-medium">{project.clientContactPerson}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Progress</p>
                          <p className="font-medium">{project.progress}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Stage</p>
                          <p className="font-medium">{project.stage}</p>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
