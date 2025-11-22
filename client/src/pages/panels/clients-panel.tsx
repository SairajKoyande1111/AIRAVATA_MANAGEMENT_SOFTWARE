import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { Mail, Phone, MapPin, Building, Calendar, User, Briefcase, ChevronDown, ChevronUp, Edit, Trash2, Eye } from 'lucide-react';

export default function ClientsPanel() {
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

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
      toast({
        title: 'Error',
        description: 'Failed to fetch clients',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      toast({
        title: 'Success',
        description: 'Client deleted successfully',
      });

      setDeleteClientId(null);
      fetchClients();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditClient = async () => {
    if (!editingClient) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/clients/${editingClient._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingClient),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update client');
      }

      toast({
        title: 'Success',
        description: 'Client updated successfully',
      });

      setEditDialogOpen(false);
      setEditingClient(null);
      fetchClients();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!selectedDate) return matchesSearch;

    const clientDate = new Date(client.createdAt).toLocaleDateString('en-IN');
    return matchesSearch && clientDate === selectedDate;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'NA';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground">View and manage all registered clients</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Search by Company/Client Name</label>
            <Input
              placeholder="Search by company name, client name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-clients"
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Registration Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  const date = new Date(e.target.value);
                  const formatted = date.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
                  setSelectedDate(formatted);
                } else {
                  setSelectedDate('');
                }
              }}
              data-testid="input-filter-date"
              className="w-full"
            />
          </div>
          <div className="flex items-end">
            {(searchTerm || selectedDate) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDate('');
                }}
                data-testid="button-clear-filters"
                className="w-full"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {clients.length === 0
                  ? 'No clients registered yet. Go to "Register Client" to add your first client.'
                  : 'No clients match your search criteria.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client._id} data-testid={`card-client-${client._id}`} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{client.companyName}</CardTitle>
                      {client.services && client.services.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {client.services.length} service{client.services.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {client.clientName} {client.designation && `- ${client.designation}`}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={editDialogOpen && editingClient?._id === client._id} onOpenChange={setEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingClient(client);
                            setEditDialogOpen(true);
                          }}
                          data-testid={`button-edit-${client._id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Client</DialogTitle>
                          <DialogDescription>Update client information</DialogDescription>
                        </DialogHeader>
                        {editingClient && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Company Name</Label>
                                <Input
                                  value={editingClient.companyName}
                                  onChange={(e) => setEditingClient({ ...editingClient, companyName: e.target.value })}
                                  data-testid="input-edit-company"
                                />
                              </div>
                              <div>
                                <Label>Client Name</Label>
                                <Input
                                  value={editingClient.clientName}
                                  onChange={(e) => setEditingClient({ ...editingClient, clientName: e.target.value })}
                                  data-testid="input-edit-client"
                                />
                              </div>
                              <div>
                                <Label>Email</Label>
                                <Input
                                  type="email"
                                  value={editingClient.email}
                                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                                  data-testid="input-edit-email"
                                />
                              </div>
                              <div>
                                <Label>Phone</Label>
                                <Input
                                  value={editingClient.phone}
                                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                                  data-testid="input-edit-phone"
                                />
                              </div>
                              <div>
                                <Label>Designation</Label>
                                <Input
                                  value={editingClient.designation}
                                  onChange={(e) => setEditingClient({ ...editingClient, designation: e.target.value })}
                                  data-testid="input-edit-designation"
                                />
                              </div>
                              <div>
                                <Label>Industry Type</Label>
                                <Input
                                  value={editingClient.industryType}
                                  onChange={(e) => setEditingClient({ ...editingClient, industryType: e.target.value })}
                                  data-testid="input-edit-industry"
                                />
                              </div>
                              <div className="col-span-2">
                                <Label>Company Address</Label>
                                <Input
                                  value={editingClient.companyAddress}
                                  onChange={(e) => setEditingClient({ ...editingClient, companyAddress: e.target.value })}
                                  data-testid="input-edit-address"
                                />
                              </div>
                              <div className="col-span-2">
                                <Label>Business Overview</Label>
                                <Input
                                  value={editingClient.businessOverview}
                                  onChange={(e) => setEditingClient({ ...editingClient, businessOverview: e.target.value })}
                                  data-testid="input-edit-overview"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleEditClient} data-testid="button-save-edit">
                                Save Changes
                              </Button>
                              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpandedClient(expandedClient === client._id ? null : client._id)}
                      data-testid={`button-view-${client._id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteClientId(client._id)}
                      data-testid={`button-delete-${client._id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Summary Row */}
              <CardContent className="pb-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                    <p className="text-gray-900 mt-1 truncate">{client.email}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Phone className="w-4 h-4" />
                      Phone
                    </div>
                    <p className="text-gray-900 mt-1">{client.phone}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Building className="w-4 h-4" />
                      Industry
                    </div>
                    <p className="text-gray-900 mt-1">{client.industryType || 'NA'}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Registered
                    </div>
                    <p className="text-gray-900 mt-1 text-xs">{formatDate(client.createdAt)}</p>
                  </div>
                </div>
              </CardContent>

              {/* Expandable Details */}
              {expandedClient === client._id && (
                <CardContent className="pt-0 border-t space-y-4">
                  {/* Basic Information */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-gray-700">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Company Address:</span>
                        <p className="text-gray-900">{client.companyAddress || 'NA'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Business Overview:</span>
                        <p className="text-gray-900">{client.businessOverview || 'NA'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Meeting Information */}
                  {(client.meetingDate || client.meetingMode) && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700">Meeting Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {client.meetingDate && (
                          <div>
                            <span className="text-gray-600">Meeting Date:</span>
                            <p className="text-gray-900">{formatDate(client.meetingDate)}</p>
                          </div>
                        )}
                        {client.meetingTime && client.meetingTime !== 'NA' && (
                          <div>
                            <span className="text-gray-600">Meeting Time:</span>
                            <p className="text-gray-900">{client.meetingTime}</p>
                          </div>
                        )}
                        {client.meetingLocation && client.meetingLocation !== 'NA' && (
                          <div>
                            <span className="text-gray-600">Location:</span>
                            <p className="text-gray-900">{client.meetingLocation}</p>
                          </div>
                        )}
                        {client.meetingMode && client.meetingMode !== 'NA' && (
                          <div>
                            <span className="text-gray-600">Mode:</span>
                            <p className="text-gray-900">{client.meetingMode}</p>
                          </div>
                        )}
                        {client.salesPersons && client.salesPersons.length > 0 && (
                          <div className="col-span-2">
                            <span className="text-gray-600">Sales/BD Person:</span>
                            <p className="text-gray-900">{client.salesPersons.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Services Required */}
                  {client.services && client.services.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700">Services Required</h4>
                      <div className="flex flex-wrap gap-2">
                        {client.services.map((service: string) => (
                          <Badge key={service} variant="outline">
                            {service === 'WEBSITE' && 'Website Development'}
                            {service === 'MOBILE APP' && 'Mobile App Development'}
                            {service === 'CUSTOM SOFTWARE' && 'Custom Software Solution'}
                            {service === 'DIGITAL MARKETING' && 'Digital Marketing'}
                            {service === 'OTHERS' && 'Others'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Client Requirements */}
                  {((client.problems && client.problems.length > 0) ||
                    (client.requirements && client.requirements.length > 0) ||
                    (client.technicalRequirements && client.technicalRequirements.length > 0)) && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700">Client Requirements</h4>
                      <div className="space-y-2 text-sm">
                        {client.problems && client.problems.length > 0 && (
                          <div>
                            <span className="text-gray-600">Problems Facing:</span>
                            <ul className="list-disc list-inside text-gray-900">
                              {client.problems.map((problem: string, idx: number) => (
                                <li key={idx}>{problem}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {client.requirements && client.requirements.length > 0 && (
                          <div>
                            <span className="text-gray-600">Requirements:</span>
                            <ul className="list-disc list-inside text-gray-900">
                              {client.requirements.map((req: string, idx: number) => (
                                <li key={idx}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {client.technicalRequirements && client.technicalRequirements.length > 0 && (
                          <div>
                            <span className="text-gray-600">Technical Requirements:</span>
                            <ul className="list-disc list-inside text-gray-900">
                              {client.technicalRequirements.map((tech: string, idx: number) => (
                                <li key={idx}>{tech}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Budget & Timeline */}
                  {(client.expectedBudget || client.projectTimeline || client.urgencyLevel) && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700">Budget & Timeline</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        {client.expectedBudget && client.expectedBudget !== 'NA' && (
                          <div>
                            <span className="text-gray-600">Budget:</span>
                            <p className="text-gray-900">{client.expectedBudget}</p>
                          </div>
                        )}
                        {client.projectTimeline && client.projectTimeline !== 'NA' && (
                          <div>
                            <span className="text-gray-600">Timeline:</span>
                            <p className="text-gray-900">{client.projectTimeline}</p>
                          </div>
                        )}
                        {client.urgencyLevel && (
                          <div>
                            <span className="text-gray-600">Urgency:</span>
                            <p className="text-gray-900">
                              <Badge
                                variant={
                                  client.urgencyLevel === 'High'
                                    ? 'destructive'
                                    : client.urgencyLevel === 'Medium'
                                      ? 'secondary'
                                      : 'outline'
                                }
                              >
                                {client.urgencyLevel}
                              </Badge>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Information */}
                  {(client.nextFollowUpDate || client.nextAction) && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700">Follow-up & Next Steps</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {client.nextFollowUpDate && (
                          <div>
                            <span className="text-gray-600">Next Follow-up:</span>
                            <p className="text-gray-900">{formatDate(client.nextFollowUpDate)}</p>
                          </div>
                        )}
                        {client.nextAction && client.nextAction !== 'NA' && (
                          <div>
                            <span className="text-gray-600">Next Action:</span>
                            <p className="text-gray-900">{client.nextAction}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Decision Maker */}
                  {client.decisionMaker && client.decisionMaker !== 'NA' && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700">Decision Maker</h4>
                      <p className="text-gray-900 text-sm">{client.decisionMaker}</p>
                    </div>
                  )}

                  {/* Custom Notes */}
                  {client.customNotes && client.customNotes !== 'NA' && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700">Notes</h4>
                      <p className="text-gray-900 text-sm">{client.customNotes}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteClientId} onOpenChange={(open) => !open && setDeleteClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteClientId && handleDeleteClient(deleteClientId)}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredClients.length} of {clients.length} clients
      </div>
    </div>
  );
}
