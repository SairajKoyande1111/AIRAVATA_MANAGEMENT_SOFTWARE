import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChevronDown, Plus, Trash2, HelpCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Project {
  _id: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientContactPerson: string;
  clientMobileNumber: string;
  clientEmail: string;
  services: string[];
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
  clientContactPerson: '',
  clientMobileNumber: '',
  clientEmail: '',
  services: [] as string[],
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

function FieldLabel({ label, description }: { label: string; description: string }) {
  return (
    <div className="mb-2">
      <label className="block font-medium text-sm mb-1">{label}</label>
      <p className="text-xs text-muted-foreground italic">{description}</p>
    </div>
  );
}

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
        const data = await response.json();
        toast.success(`✅ Project created successfully with Client ID: ${data.clientId}`);
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
          <TabsTrigger value="form">📝 Create Project</TabsTrigger>
          <TabsTrigger value="list">📋 Project List ({projects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-2xl">Create New Project</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">Fill in all the project details below. Required fields are marked with *</p>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleCreateProject} className="space-y-8">
                {/* 1. BASIC PROJECT DETAILS */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-bold text-blue-700 mb-4">📌 Section 1: Basic Project Details</h3>
                  <p className="text-sm text-muted-foreground mb-4">Enter the core information about your project and client</p>

                  <div className="space-y-4">
                    <div>
                      <FieldLabel label="Project Name *" description="What is the name of this project? (e.g., 'E-commerce Website for XYZ Inc')" />
                      <Input
                        placeholder="e.g., Mobile App Development"
                        value={formData.projectName}
                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        required
                        data-testid="input-project-name"
                      />
                    </div>

                    <div>
                      <FieldLabel label="🔐 Client ID (Auto-Generated)" description="Client ID will be automatically assigned (JSSR01, JSSR02, etc.) when you create the project" />
                      <div className="p-3 bg-blue-100 border border-blue-300 rounded text-sm font-medium text-blue-800" data-testid="display-client-id">
                        ✓ Your Client ID will be generated automatically when you submit the form
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel label="Contact Person *" description="Primary contact name at the client's company" />
                        <Input
                          placeholder="e.g., John Smith"
                          value={formData.clientContactPerson}
                          onChange={(e) => setFormData({ ...formData, clientContactPerson: e.target.value })}
                          required
                          data-testid="input-contact-person"
                        />
                      </div>
                      <div>
                        <FieldLabel label="Mobile Number *" description="Client's phone number for communication" />
                        <Input
                          placeholder="e.g., +91 98765 43210"
                          value={formData.clientMobileNumber}
                          onChange={(e) => setFormData({ ...formData, clientMobileNumber: e.target.value })}
                          required
                          data-testid="input-mobile"
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabel label="Email *" description="Client's email address for official communication and updates" />
                      <Input
                        placeholder="e.g., contact@client.com"
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        required
                        data-testid="input-email"
                      />
                    </div>

                    <div>
                      <FieldLabel label="Services *" description="Select all services you will provide for this client (you can choose multiple)" />
                      <div className="space-y-2 p-3 border rounded bg-gray-50">
                        {['Website Development', 'Mobile App Development', 'Custom Software Development', 'Digital Marketing'].map((service) => (
                          <label key={service} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.services.includes(service)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, services: [...formData.services, service] });
                                } else {
                                  setFormData({ ...formData, services: formData.services.filter(s => s !== service) });
                                }
                              }}
                              className="w-4 h-4"
                              data-testid={`checkbox-service-${service.toLowerCase().replace(/\s+/g, '-')}`}
                            />
                            <span className="text-sm">{service}</span>
                          </label>
                        ))}
                      </div>
                      {formData.services.length === 0 && <p className="text-xs text-red-500 mt-1">⚠️ Please select at least one service</p>}
                      {formData.services.length > 0 && <p className="text-xs text-green-600 mt-1">✓ Selected: {formData.services.join(', ')}</p>}
                    </div>

                    <div>
                      <FieldLabel label="Project Description" description="Brief overview of what this project is about and its objectives" />
                      <Textarea
                        placeholder="Describe the project goals, scope, and key requirements..."
                        value={formData.projectDescription}
                        onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                        className="min-h-24"
                        data-testid="textarea-description"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. PROJECT TIMELINE */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-lg font-bold text-green-700 mb-4">⏰ Section 2: Project Timeline</h3>
                  <p className="text-sm text-muted-foreground mb-4">When should this project start and end?</p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel label="Start Date" description="When does the project officially begin?" />
                        <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required data-testid="input-start-date" />
                      </div>
                      <div>
                        <FieldLabel label="Expected End Date" description="When do you expect to complete the project?" />
                        <Input type="date" value={formData.expectedEndDate} onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })} required data-testid="input-end-date" />
                      </div>
                    </div>

                    <div>
                      <FieldLabel label="Actual End Date (Optional)" description="When was the project actually completed? Leave empty if not finished yet" />
                      <Input type="date" value={formData.actualEndDate} onChange={(e) => setFormData({ ...formData, actualEndDate: e.target.value })} data-testid="input-actual-end-date" />
                    </div>
                  </div>
                </div>

                {/* 3. PROJECT STATUS & PRIORITY */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-lg font-bold text-purple-700 mb-4">🎯 Section 3: Project Status & Priority</h3>
                  <p className="text-sm text-muted-foreground mb-4">What's the current status and importance of this project?</p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel label="Project Status" description="Current state: Not Started, In Progress, On Hold, Completed, or Cancelled" />
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
                      </div>

                      <div>
                        <FieldLabel label="Priority Level" description="How urgent is this project? (Low, Medium, High, or Critical)" />
                        <Select value={formData.priorityLevel} onValueChange={(val) => setFormData({ ...formData, priorityLevel: val })}>
                          <SelectTrigger data-testid="select-priority">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical 🔴</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel label="Current Stage" description="Which phase is the project in? (Requirements, Development, Testing, Deployment, Maintenance)" />
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

                      <div>
                        <FieldLabel label="Progress %" description="How much work is complete? (0-100%). Auto-updates as tasks are completed" />
                        <Input type="number" min="0" max="100" value={formData.progress} onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })} data-testid="input-progress" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. COMMUNICATION & NOTES */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="text-lg font-bold text-orange-700 mb-4">💬 Section 6: Communication & Notes</h3>
                  <p className="text-sm text-muted-foreground mb-4">Track all discussions and feedback about this project</p>

                  <div className="space-y-4">
                    <div>
                      <FieldLabel label="Meeting Notes" description="Summary of discussions with the client or team about this project" />
                      <Textarea
                        placeholder="e.g., Client requested additional features in the dashboard. Discussed timeline extension..."
                        value={formData.meetingNotes}
                        onChange={(e) => setFormData({ ...formData, meetingNotes: e.target.value })}
                        className="min-h-20"
                        data-testid="textarea-meeting-notes"
                      />
                    </div>

                    <div>
                      <FieldLabel label="Client Feedback" description="What is the client saying about the project? Their concerns, praise, or suggestions" />
                      <Textarea
                        placeholder="e.g., Client is happy with the design. Wants faster loading times..."
                        value={formData.clientFeedback}
                        onChange={(e) => setFormData({ ...formData, clientFeedback: e.target.value })}
                        className="min-h-20"
                        data-testid="textarea-client-feedback"
                      />
                    </div>

                    <div>
                      <FieldLabel label="Internal Notes" description="Internal team notes - things for your team to remember about this project" />
                      <Textarea
                        placeholder="e.g., Watch out for API integration issues. Budget is tight..."
                        value={formData.internalNotes}
                        onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                        className="min-h-20"
                        data-testid="textarea-internal-notes"
                      />
                    </div>

                    <div>
                      <FieldLabel label="Next Action Date" description="When should we follow up with the client or take the next action?" />
                      <Input type="date" value={formData.nextActionDate} onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })} data-testid="input-next-action-date" />
                    </div>
                  </div>
                </div>

                {/* 7. FINANCIAL SECTION */}
                <div className="border-l-4 border-green-600 pl-4">
                  <h3 className="text-lg font-bold text-green-700 mb-4">💰 Section 7: Financial Information</h3>
                  <p className="text-sm text-muted-foreground mb-4">Track project costs and payments</p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel label="Estimated Cost (₹)" description="How much do you estimate this project will cost?" />
                        <Input type="number" placeholder="100000" value={formData.financial.estimatedCost} onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, estimatedCost: parseInt(e.target.value) || 0 } })} data-testid="input-estimated-cost" />
                      </div>
                      <div>
                        <FieldLabel label="Amount Quoted (₹)" description="How much did you quote to the client?" />
                        <Input type="number" placeholder="100000" value={formData.financial.amountQuoted} onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, amountQuoted: parseInt(e.target.value) || 0 } })} data-testid="input-amount-quoted" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel label="Amount Received (₹)" description="How much has the client paid so far?" />
                        <Input type="number" placeholder="0" value={formData.financial.amountReceived} onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, amountReceived: parseInt(e.target.value) || 0 } })} data-testid="input-amount-received" />
                      </div>
                      <div>
                        <FieldLabel label="Payment Status" description="Is the payment pending, partially paid, or completed?" />
                        <Select value={formData.financial.paymentStatus} onValueChange={(val) => setFormData({ ...formData, financial: { ...formData.financial, paymentStatus: val } })}>
                          <SelectTrigger data-testid="select-payment-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending (Not paid)</SelectItem>
                            <SelectItem value="Partial">Partial (Paid some)</SelectItem>
                            <SelectItem value="Completed">Completed (Fully paid)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <FieldLabel label="Invoice Details" description="Invoice numbers, dates, or any important billing information" />
                      <Input placeholder="e.g., INV-2024-001, Invoice date: 15/11/2024" value={formData.financial.invoiceDetails} onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, invoiceDetails: e.target.value } })} data-testid="input-invoice-details" />
                    </div>
                  </div>
                </div>

                {/* 8. TECHNICAL DETAILS */}
                <div className="border-l-4 border-pink-500 pl-4">
                  <h3 className="text-lg font-bold text-pink-700 mb-4">⚙️ Section 8: Technical Details</h3>
                  <p className="text-sm text-muted-foreground mb-4">For software/tech projects - what technology is being used?</p>

                  <div className="space-y-4">
                    <div>
                      <FieldLabel label="Technology Stack" description="List the main technologies (languages, frameworks, databases, etc.) - separated by commas" />
                      <Input placeholder="e.g., React, Node.js, MongoDB, AWS" value={formData.technicalDetails.technologyStack} onChange={(e) => setFormData({ ...formData, technicalDetails: { ...formData.technicalDetails, technologyStack: e.target.value } })} data-testid="input-tech-stack" />
                    </div>

                    <div>
                      <FieldLabel label="Hosting Details" description="Where is the application hosted? (e.g., AWS, GCP, Azure, etc.)" />
                      <Input placeholder="e.g., AWS EC2 with RDS" value={formData.technicalDetails.hostingDetails} onChange={(e) => setFormData({ ...formData, technicalDetails: { ...formData.technicalDetails, hostingDetails: e.target.value } })} data-testid="input-hosting" />
                    </div>

                    <div>
                      <FieldLabel label="Domain Details" description="What is the website domain? (e.g., www.example.com)" />
                      <Input placeholder="e.g., www.clientname.com" value={formData.technicalDetails.domainDetails} onChange={(e) => setFormData({ ...formData, technicalDetails: { ...formData.technicalDetails, domainDetails: e.target.value } })} data-testid="input-domain" />
                    </div>

                    <div>
                      <FieldLabel label="Credentials" description="Store login credentials, API keys, or access information (keep secure!)" />
                      <Input placeholder="e.g., Admin panel login credentials (store separately for security)" value={formData.technicalDetails.credentials} onChange={(e) => setFormData({ ...formData, technicalDetails: { ...formData.technicalDetails, credentials: e.target.value } })} data-testid="input-credentials" />
                    </div>
                  </div>
                </div>

                {/* 9. DEPLOYMENT & DELIVERY */}
                <div className="border-l-4 border-cyan-500 pl-4">
                  <h3 className="text-lg font-bold text-cyan-700 mb-4">🚀 Section 9: Deployment & Delivery</h3>
                  <p className="text-sm text-muted-foreground mb-4">When and how is the project being released to the client?</p>

                  <div className="space-y-4">
                    <div>
                      <FieldLabel label="Deployment Status" description="Has the project been deployed (released) to production yet?" />
                      <Select value={formData.deployment.deploymentStatus} onValueChange={(val) => setFormData({ ...formData, deployment: { ...formData.deployment, deploymentStatus: val } })}>
                        <SelectTrigger data-testid="select-deployment-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed ✓</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <FieldLabel label="Deployment Date" description="When was (or will be) the project officially deployed?" />
                      <Input type="date" value={formData.deployment.deploymentDate} onChange={(e) => setFormData({ ...formData, deployment: { ...formData.deployment, deploymentDate: e.target.value } })} data-testid="input-deployment-date" />
                    </div>

                    <div>
                      <FieldLabel label="UAT Notes" description="User Acceptance Testing - what issues were found and fixed during testing with the client?" />
                      <Textarea
                        placeholder="e.g., Client found 3 bugs in the payment module. All fixed and retested..."
                        value={formData.deployment.uatNotes}
                        onChange={(e) => setFormData({ ...formData, deployment: { ...formData.deployment, uatNotes: e.target.value } })}
                        className="min-h-20"
                        data-testid="textarea-uat-notes"
                      />
                    </div>

                    <div>
                      <FieldLabel label="Maintenance Period" description="How long will you provide maintenance and support for this project?" />
                      <Input placeholder="e.g., 6 months, 1 year, 2 years" value={formData.deployment.maintenancePeriod} onChange={(e) => setFormData({ ...formData, deployment: { ...formData.deployment, maintenancePeriod: e.target.value } })} data-testid="input-maintenance-period" />
                    </div>
                  </div>
                </div>

                {/* 10. COMPLETION SUMMARY */}
                <div className="border-l-4 border-teal-500 pl-4">
                  <h3 className="text-lg font-bold text-teal-700 mb-4">✅ Section 10: Completion Summary</h3>
                  <p className="text-sm text-muted-foreground mb-4">Final notes and approval after project is done</p>

                  <div className="space-y-4">
                    <div>
                      <FieldLabel label="Final Remarks" description="Any final thoughts, lessons learned, or notes about this project" />
                      <Textarea placeholder="e.g., Project completed successfully. Client very satisfied. Good teamwork..." value={formData.finalRemarks} onChange={(e) => setFormData({ ...formData, finalRemarks: e.target.value })} className="min-h-20" data-testid="textarea-final-remarks" />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                      <input type="checkbox" checked={formData.clientApproval} onChange={(e) => setFormData({ ...formData, clientApproval: e.target.checked })} id="client-approval" data-testid="checkbox-client-approval" className="w-4 h-4" />
                      <label htmlFor="client-approval" className="text-sm cursor-pointer">
                        <strong>Client Approval / Sign-Off</strong> - Check this when the client has officially accepted and signed off on the project
                      </label>
                    </div>

                    <div>
                      <FieldLabel label="Project Rating (1-5 stars)" description="How would you rate this project? (1=Poor, 5=Excellent) - for your records" />
                      <Input type="number" min="1" max="5" placeholder="5" value={formData.projectRating} onChange={(e) => setFormData({ ...formData, projectRating: parseInt(e.target.value) || 0 })} data-testid="input-rating" />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full py-6 text-lg font-bold" data-testid="button-submit-project">
                  ✨ Create Project
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No projects yet. Create one using the "Create Project" tab!</p>
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
                        </div>
                        <p className="text-sm text-muted-foreground">{project.projectType}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleDeleteProject(project._id)} data-testid={`button-delete-project-${project._id}`}>
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
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-medium">{project.projectStatus}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Priority</p>
                          <p className="font-medium">{project.priorityLevel}</p>
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
