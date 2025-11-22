import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, TrendingUp, Calendar } from 'lucide-react';

const fixedUsers = ['Aniket', 'Sairaj', 'Sejal', 'Pratik', 'Abhijeet'];
const stages = ['new', 'contacted', 'qualified', 'proposal', 'meeting', 'negotiation', 'won', 'lost'];
const priorities = ['low', 'medium', 'high'];
const requirementTypes = ['Website', 'Mobile app', 'Custom software', 'Digital marketing', 'Other'];

interface Lead {
  _id: string;
  clientId: {
    _id: string;
    companyName: string;
    clientName: string;
    email: string;
    phone: string;
  };
  registeredDate: string;
  assignedTo: string;
  requirementType: string;
  otherText?: string;
  requirementDetails: string[];
  priority: string;
  stage: string;
  estimatedBudget?: number;
  nextFollowUp?: string;
  notes?: string;
  createdAt: string;
}

export default function LeadsPanel() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [filterStage, setFilterStage] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssigned, setFilterAssigned] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    clientId: '',
    registeredDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    requirementType: '',
    otherText: '',
    requirementDetails: [] as string[],
    priority: 'medium',
    stage: 'new',
    estimatedBudget: '',
    nextFollowUp: '',
    notes: '',
  });

  useEffect(() => {
    fetchLeads();
    fetchClients();
    
    // Check if there's a pre-selected client from the Clients panel
    const selectedClient = localStorage.getItem('selectedClientForLead');
    if (selectedClient) {
      try {
        const client = JSON.parse(selectedClient);
        setFormData((prev) => ({ ...prev, clientId: client._id }));
        setCreateDialogOpen(true);
        localStorage.removeItem('selectedClientForLead');
      } catch (error) {
        console.error('Failed to parse selected client');
      }
    }
  }, []);

  const fetchLeads = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/leads', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Failed to fetch leads');
      toast({
        title: 'Error',
        description: 'Failed to fetch leads',
        variant: 'destructive',
      });
    }
  };

  const fetchClients = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Failed to fetch clients');
    }
  };

  const handleCreateLead = async () => {
    if (!formData.clientId || !formData.assignedTo || !formData.requirementType) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          requirementDetails: typeof formData.requirementDetails === 'string' 
            ? formData.requirementDetails.split('\n').filter((r: string) => r.trim())
            : formData.requirementDetails,
          estimatedBudget: formData.estimatedBudget ? parseInt(formData.estimatedBudget) : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast({
        title: 'Success',
        description: 'Lead created successfully',
      });

      setCreateDialogOpen(false);
      setFormData({
        clientId: '',
        registeredDate: new Date().toISOString().split('T')[0],
        assignedTo: '',
        requirementType: '',
        otherText: '',
        requirementDetails: '',
        priority: 'medium',
        stage: 'new',
        estimatedBudget: '',
        nextFollowUp: '',
        notes: '',
      });
      fetchLeads();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateLead = async () => {
    if (!editingLead) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/leads/${editingLead._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: editingLead.stage,
          priority: editingLead.priority,
          assignedTo: editingLead.assignedTo,
          estimatedBudget: editingLead.estimatedBudget,
          nextFollowUp: editingLead.nextFollowUp,
          notes: editingLead.notes,
          requirementDetails: typeof editingLead.requirementDetails === 'string' 
            ? editingLead.requirementDetails.split('\n').filter(r => r.trim())
            : editingLead.requirementDetails,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast({
        title: 'Success',
        description: 'Lead updated successfully',
      });

      setEditDialogOpen(false);
      setEditingLead(null);
      fetchLeads();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete lead');

      toast({
        title: 'Success',
        description: 'Lead deleted successfully',
      });

      setDeleteLeadId(null);
      fetchLeads();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (filterStage !== 'all' && lead.stage !== filterStage) return false;
    if (filterPriority !== 'all' && lead.priority !== filterPriority) return false;
    if (filterAssigned !== 'all' && lead.assignedTo !== filterAssigned) return false;
    return true;
  });

  const stageColors: Record<string, string> = {
    new: 'bg-gray-100 text-gray-800',
    contacted: 'bg-blue-100 text-blue-800',
    qualified: 'bg-cyan-100 text-cyan-800',
    proposal: 'bg-purple-100 text-purple-800',
    meeting: 'bg-yellow-100 text-yellow-800',
    negotiation: 'bg-orange-100 text-orange-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-200 text-gray-700',
    medium: 'bg-blue-200 text-blue-700',
    high: 'bg-red-200 text-red-700',
  };

  return (
    <div className="p-8 w-full">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Track leads through the sales pipeline</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-lead">
              <Plus className="w-4 h-4 mr-2" />
              Create Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Lead</DialogTitle>
              <DialogDescription>Add a new sales opportunity from a client</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientId">Client *</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                  <SelectTrigger id="clientId" data-testid="select-client">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.companyName} - {client.clientName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registeredDate">Registration Date *</Label>
                  <Input
                    id="registeredDate"
                    type="date"
                    value={formData.registeredDate}
                    onChange={(e) => setFormData({ ...formData, registeredDate: e.target.value })}
                    data-testid="input-registration-date"
                  />
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assigned To *</Label>
                  <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                    <SelectTrigger id="assignedTo" data-testid="select-assigned-to">
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {fixedUsers.map((user) => (
                        <SelectItem key={user} value={user}>
                          {user}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requirementType">Service Required *</Label>
                  <Select value={formData.requirementType} onValueChange={(value) => setFormData({ ...formData, requirementType: value })}>
                    <SelectTrigger id="requirementType" data-testid="select-requirement-type">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {requirementTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger id="priority" data-testid="select-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.requirementType === 'Other' && (
                <div>
                  <Label htmlFor="otherText">Specify Service</Label>
                  <Input
                    id="otherText"
                    value={formData.otherText}
                    onChange={(e) => setFormData({ ...formData, otherText: e.target.value })}
                    placeholder="Describe the service"
                    data-testid="input-other-text"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="requirementDetails">Requirements (one per line)</Label>
                <Textarea
                  id="requirementDetails"
                  value={formData.requirementDetails}
                  onChange={(e) => setFormData({ ...formData, requirementDetails: e.target.value })}
                  placeholder="Add requirement details..."
                  data-testid="textarea-requirements"
                  className="h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedBudget">Estimated Budget ($)</Label>
                  <Input
                    id="estimatedBudget"
                    type="number"
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    placeholder="0"
                    data-testid="input-budget"
                  />
                </div>
                <div>
                  <Label htmlFor="nextFollowUp">Next Follow-up Date</Label>
                  <Input
                    id="nextFollowUp"
                    type="date"
                    value={formData.nextFollowUp}
                    onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
                    data-testid="input-followup-date"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes..."
                  data-testid="textarea-notes"
                  className="h-20"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLead} data-testid="button-create-lead-submit">
                  Create Lead
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="filter-stage">Filter by Stage</Label>
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger id="filter-stage" data-testid="select-filter-stage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="filter-priority">Filter by Priority</Label>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger id="filter-priority" data-testid="select-filter-priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {priorities.map((p) => (
                <SelectItem key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="filter-assigned">Filter by Assigned To</Label>
          <Select value={filterAssigned} onValueChange={setFilterAssigned}>
            <SelectTrigger id="filter-assigned" data-testid="select-filter-assigned">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {fixedUsers.map((user) => (
                <SelectItem key={user} value={user}>
                  {user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No leads found. Create your first lead to get started!</p>
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => (
            <Card key={lead._id} data-testid={`card-lead-${lead._id}`} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{lead.clientId?.companyName}</CardTitle>
                      <Badge className={stageColors[lead.stage]} variant="secondary">
                        {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}
                      </Badge>
                      <Badge className={priorityColors[lead.priority]} variant="secondary">
                        {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="text-sm">
                        <p>Contact: {lead.clientId?.clientName}</p>
                        <p>Service: {lead.requirementType}</p>
                        {lead.estimatedBudget && <p>Budget: ${lead.estimatedBudget?.toLocaleString()}</p>}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingLead(lead);
                        setEditDialogOpen(true);
                      }}
                      data-testid={`button-edit-lead-${lead._id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteLeadId(lead._id)}
                      data-testid={`button-delete-lead-${lead._id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Assigned To</div>
                    <p className="text-gray-900 mt-1 font-medium">{lead.assignedTo}</p>
                  </div>
                  <div>
                    <div className="text-gray-600">Lead Date</div>
                    <p className="text-gray-900 mt-1">{new Date(lead.registeredDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <div className="text-gray-600">Email</div>
                    <p className="text-gray-900 mt-1 truncate">{lead.clientId?.email}</p>
                  </div>
                  <div>
                    <div className="text-gray-600">Phone</div>
                    <p className="text-gray-900 mt-1">{lead.clientId?.phone}</p>
                  </div>
                </div>

                {lead.requirementDetails && lead.requirementDetails.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Requirements:</div>
                    <div className="flex flex-wrap gap-2">
                      {lead.requirementDetails.map((req, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {lead.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Notes:</div>
                    <p className="text-sm text-gray-600">{lead.notes}</p>
                  </div>
                )}

                {lead.nextFollowUp && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                    <Calendar className="w-4 h-4" />
                    Follow-up: {new Date(lead.nextFollowUp).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>Update lead details and status</DialogDescription>
          </DialogHeader>
          {editingLead && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-stage">Stage</Label>
                <Select value={editingLead.stage} onValueChange={(value) => setEditingLead({ ...editingLead, stage: value })}>
                  <SelectTrigger id="edit-stage" data-testid="select-edit-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={editingLead.priority} onValueChange={(value) => setEditingLead({ ...editingLead, priority: value })}>
                    <SelectTrigger id="edit-priority" data-testid="select-edit-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-assigned">Assigned To</Label>
                  <Select value={editingLead.assignedTo} onValueChange={(value) => setEditingLead({ ...editingLead, assignedTo: value })}>
                    <SelectTrigger id="edit-assigned" data-testid="select-edit-assigned">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fixedUsers.map((user) => (
                        <SelectItem key={user} value={user}>
                          {user}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-budget">Estimated Budget ($)</Label>
                  <Input
                    id="edit-budget"
                    type="number"
                    value={editingLead.estimatedBudget || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, estimatedBudget: e.target.value ? parseInt(e.target.value) : undefined })}
                    data-testid="input-edit-budget"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-followup">Next Follow-up Date</Label>
                  <Input
                    id="edit-followup"
                    type="date"
                    value={editingLead.nextFollowUp ? editingLead.nextFollowUp.split('T')[0] : ''}
                    onChange={(e) => setEditingLead({ ...editingLead, nextFollowUp: e.target.value })}
                    data-testid="input-edit-followup"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-requirements">Requirements</Label>
                <Textarea
                  id="edit-requirements"
                  value={Array.isArray(editingLead.requirementDetails) ? editingLead.requirementDetails.join('\n') : editingLead.requirementDetails}
                  onChange={(e) => setEditingLead({ ...editingLead, requirementDetails: e.target.value as any })}
                  placeholder="One requirement per line"
                  data-testid="textarea-edit-requirements"
                  className="h-24"
                />
              </div>

              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingLead.notes || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  placeholder="Add any notes..."
                  data-testid="textarea-edit-notes"
                  className="h-20"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateLead} data-testid="button-update-lead">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteLeadId} onOpenChange={(open) => !open && setDeleteLeadId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteLeadId && handleDeleteLead(deleteLeadId)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete-lead"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
