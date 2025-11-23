import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Project {
  _id: string;
  projectId: string;
  projectName: string;
  clientId: string;
}

interface OngoingProject {
  _id: string;
  projectId: string;
  projectName: string;
  clientId: string;
  assignedTeamMembers: string[];
  startDate: string;
  endDate: string;
  status: string;
}

const TEAM_MEMBERS = ['Aniket', 'Sairaj', 'Sejal', 'Pratik', 'Abhijeet'];
const STATUSES = ['Not Started', 'In Progress', 'On Hold', 'Completed'];

const DEFAULT_FORM = {
  projectId: '',
  assignedTeamMembers: [] as string[],
  startDate: '',
  endDate: '',
  status: 'Not Started',
};

export default function OngoingProjectsPanel() {
  const [projects, setProjects] = useState<OngoingProject[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('form');
  const [editingId, setEditingId] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  const fetchOngoingProjects = async () => {
    try {
      const response = await fetch('/api/ongoing-projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.ongoingProjects || []);
      }
    } catch (error) {
      console.error('Error fetching ongoing projects:', error);
      toast.error('Failed to load ongoing projects');
    }
  };

  const fetchAvailableProjects = async () => {
    try {
      const response = await fetch('/api/ongoing-projects/available-projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching available projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOngoingProjects();
    fetchAvailableProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectId || formData.assignedTeamMembers.length === 0 || !formData.startDate || !formData.endDate) {
      toast.error('Please fill all required fields and select at least one team member');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/ongoing-projects/${editingId}` : '/api/ongoing-projects';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: formData.projectId,
          assignedTeamMembers: formData.assignedTeamMembers,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status,
        }),
      });

      if (response.ok) {
        toast.success(editingId ? '✅ Ongoing project updated' : '✅ Ongoing project created');
        setFormData(DEFAULT_FORM);
        setEditingId(null);
        setActiveTab('list');
        await fetchOngoingProjects();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save project');
      }
    } catch (error) {
      toast.error('Failed to save ongoing project');
    }
  };

  const handleEdit = (project: OngoingProject) => {
    setFormData({
      projectId: project.projectId,
      assignedTeamMembers: project.assignedTeamMembers,
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate.split('T')[0],
      status: project.status,
    });
    setEditingId(project._id);
    setActiveTab('form');
    setExpandedProject(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ongoing project assignment?')) return;

    try {
      const response = await fetch(`/api/ongoing-projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('✅ Ongoing project deleted');
        await fetchOngoingProjects();
      }
    } catch (error) {
      toast.error('Failed to delete ongoing project');
    }
  };

  const handleCancel = () => {
    setFormData(DEFAULT_FORM);
    setEditingId(null);
  };

  const getSelectedProjectName = () => {
    const selected = availableProjects.find((p) => p._id === formData.projectId);
    return selected?.projectName || '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
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
        <p className="text-muted-foreground">Track active and on-hold projects with team assignments</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="form">📝 {editingId ? '✏️ Edit Assignment' : 'Assign Project'}</TabsTrigger>
          <TabsTrigger value="list">📋 Assignments ({projects.length})</TabsTrigger>
        </TabsList>

        {/* FORM TAB */}
        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-2xl">{editingId ? '✏️ Edit Project Assignment' : '✨ Assign Project to Team'}</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {editingId ? 'Update the project assignment details.' : 'Select a project and assign team members to track ongoing work.'}
              </p>
            </CardHeader>

            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Selection */}
                <div>
                  <label className="block font-medium text-sm mb-2">Project * </label>
                  <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
                    <SelectTrigger data-testid="select-project">
                      <SelectValue placeholder="Select a project from available list..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProjects.map((project) => (
                        <SelectItem key={project._id} value={project._id}>
                          {project.projectName} ({project.clientId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.projectId && (
                    <p className="text-xs text-green-600 mt-1">✓ Selected: {getSelectedProjectName()}</p>
                  )}
                </div>

                {/* Team Members Multi-Select */}
                <div>
                  <label className="block font-medium text-sm mb-2">Assign Team Members * (Select Multiple)</label>
                  <div className="space-y-2 p-3 border rounded bg-gray-50">
                    {TEAM_MEMBERS.map((member) => (
                      <label key={member} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.assignedTeamMembers.includes(member)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                assignedTeamMembers: [...formData.assignedTeamMembers, member],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                assignedTeamMembers: formData.assignedTeamMembers.filter((m) => m !== member),
                              });
                            }
                          }}
                          className="w-4 h-4"
                          data-testid={`checkbox-member-${member.toLowerCase()}`}
                        />
                        <span className="text-sm">{member}</span>
                      </label>
                    ))}
                  </div>
                  {formData.assignedTeamMembers.length === 0 ? (
                    <p className="text-xs text-red-500 mt-1">⚠️ Select at least one team member</p>
                  ) : (
                    <p className="text-xs text-green-600 mt-1">✓ Assigned: {formData.assignedTeamMembers.join(', ')}</p>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-sm mb-2">Start Date *</label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      data-testid="input-start-date"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-sm mb-2">End Date *</label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      data-testid="input-end-date"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block font-medium text-sm mb-2">Status</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 py-6 text-lg font-bold" data-testid="button-submit">
                    {editingId ? '💾 Update Assignment' : '✨ Create Assignment'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 py-6 text-lg font-bold" data-testid="button-cancel">
                      ✕ Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LIST TAB */}
        <TabsContent value="list" className="space-y-4">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No ongoing project assignments yet. Create one to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <Card key={project._id} data-testid={`card-ongoing-${project._id}`}>
                  <Collapsible open={expandedProject === project._id} onOpenChange={(open) => setExpandedProject(open ? project._id : null)}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold" data-testid={`text-project-name-${project._id}`}>
                            {project.projectName}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">Client ID: {project.clientId}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(project)} data-testid={`button-edit-${project._id}`}>
                            ✏️ Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(project._id)} data-testid={`button-delete-${project._id}`}>
                            🗑️ Delete
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
                      <CardContent className="space-y-4 border-t pt-6">
                        <div className="grid grid-cols-2 gap-6">
                          {/* Assigned Team Members */}
                          <div>
                            <p className="text-sm text-muted-foreground">👥 Assigned Team Members</p>
                            <div className="mt-2 space-y-1">
                              {project.assignedTeamMembers.map((member) => (
                                <Badge key={member} variant="outline" className="mr-1" data-testid={`badge-member-${project._id}-${member.toLowerCase()}`}>
                                  {member}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Status */}
                          <div>
                            <p className="text-sm text-muted-foreground">📊 Status</p>
                            <Badge className={getStatusColor(project.status)} data-testid={`badge-status-${project._id}`}>
                              {project.status}
                            </Badge>
                          </div>

                          {/* Start Date */}
                          <div>
                            <p className="text-sm text-muted-foreground">📅 Start Date</p>
                            <p className="font-medium" data-testid={`text-start-date-${project._id}`}>
                              {new Date(project.startDate).toLocaleDateString('en-IN')}
                            </p>
                          </div>

                          {/* End Date */}
                          <div>
                            <p className="text-sm text-muted-foreground">🏁 End Date</p>
                            <p className="font-medium" data-testid={`text-end-date-${project._id}`}>
                              {new Date(project.endDate).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
