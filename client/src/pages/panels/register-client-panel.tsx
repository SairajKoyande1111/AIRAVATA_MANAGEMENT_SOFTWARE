import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';

export default function RegisterClientPanel() {
  const [formData, setFormData] = useState({
    companyName: '',
    clientName: '',
    designation: '',
    phone: '',
    email: '',
    companyAddress: '',
    meetingDate: '',
    meetingTime: '',
    meetingLocation: '',
    salesPersons: [] as string[],
    meetingMode: '',
    businessOverview: '',
    industryType: '',
    problems: [] as string[],
    requirements: [] as string[],
    technicalRequirements: [] as string[],
    customNotes: '',
    services: [] as string[],
    expectedBudget: '',
    projectTimeline: '',
    decisionMaker: '',
    urgencyLevel: 'Medium',
    nextFollowUpDate: '',
    nextAction: '',
  });
  const [currentProblem, setCurrentProblem] = useState('');
  const [currentRequirement, setCurrentRequirement] = useState('');
  const [currentTechReq, setCurrentTechReq] = useState('');
  const { toast } = useToast();

  const fixedUsers = ['Aniket', 'Sairaj', 'Sejal', 'Pratik', 'Abhijeet'];
  
  const serviceOptions = [
    { value: 'WEBSITE', label: 'Website Development' },
    { value: 'MOBILE APP', label: 'Mobile App Development' },
    { value: 'CUSTOM SOFTWARE', label: 'Custom Software Solution' },
    { value: 'DIGITAL MARKETING', label: 'Digital Marketing' },
    { value: 'OTHERS', label: 'Others' },
  ];

  const handleAddProblem = () => {
    if (currentProblem.trim()) {
      setFormData({
        ...formData,
        problems: [...formData.problems, currentProblem],
      });
      setCurrentProblem('');
    }
  };

  const handleRemoveProblem = (index: number) => {
    setFormData({
      ...formData,
      problems: formData.problems.filter((_, i) => i !== index),
    });
  };

  const handleAddRequirement = () => {
    if (currentRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, currentRequirement],
      });
      setCurrentRequirement('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const handleAddTechReq = () => {
    if (currentTechReq.trim()) {
      setFormData({
        ...formData,
        technicalRequirements: [...formData.technicalRequirements, currentTechReq],
      });
      setCurrentTechReq('');
    }
  };

  const handleRemoveTechReq = (index: number) => {
    setFormData({
      ...formData,
      technicalRequirements: formData.technicalRequirements.filter((_, i) => i !== index),
    });
  };

  const handleServiceToggle = (service: string) => {
    setFormData({
      ...formData,
      services: formData.services.includes(service)
        ? formData.services.filter((s) => s !== service)
        : [...formData.services, service],
    });
  };

  const handleSalesPersonToggle = (person: string) => {
    setFormData({
      ...formData,
      salesPersons: formData.salesPersons.includes(person)
        ? formData.salesPersons.filter((p) => p !== person)
        : [...formData.salesPersons, person],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create client');
      }

      toast({
        title: 'Success',
        description: 'Client registered successfully',
      });

      setFormData({
        companyName: '',
        clientName: '',
        designation: '',
        phone: '',
        email: '',
        companyAddress: '',
        meetingDate: '',
        meetingTime: '',
        meetingLocation: '',
        salesPersons: [],
        meetingMode: '',
        businessOverview: '',
        industryType: '',
        problems: [],
        requirements: [],
        technicalRequirements: [],
        customNotes: '',
        services: [],
        expectedBudget: '',
        projectTimeline: '',
        decisionMaker: '',
        urgencyLevel: 'Medium',
        nextFollowUpDate: '',
        nextAction: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Register Client</h1>
        <p className="text-muted-foreground">Add comprehensive client information and requirements</p>
      </div>

      <Card className="border-0 shadow-none rounded-0">
        <CardHeader className="px-0 pt-0 pb-4">
          <CardTitle className="text-lg">New Client Registration</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form onSubmit={handleSubmit} className="space-y-5 pb-8">
            {/* Basic Client Information */}
            <div className="mt-0 pt-0">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">Basic Client Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    data-testid="input-company-name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name / Point of Contact</Label>
                  <Input
                    id="clientName"
                    data-testid="input-client-name"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    data-testid="input-designation"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    data-testid="input-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email ID</Label>
                  <Input
                    id="email"
                    data-testid="input-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Input
                    id="companyAddress"
                    data-testid="input-address"
                    value={formData.companyAddress}
                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Meeting Information */}
            <div className="pt-0">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">Meeting Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meetingDate">Meeting Date</Label>
                  <Input
                    id="meetingDate"
                    data-testid="input-meeting-date"
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingTime">Meeting Time</Label>
                  <Input
                    id="meetingTime"
                    data-testid="input-meeting-time"
                    type="time"
                    value={formData.meetingTime}
                    onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingLocation">Meeting Location</Label>
                  <Input
                    id="meetingLocation"
                    data-testid="input-meeting-location"
                    value={formData.meetingLocation}
                    onChange={(e) => setFormData({ ...formData, meetingLocation: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Sales/BD Person Name (Select one or more)</Label>
                  <div className="flex flex-wrap gap-2">
                    {fixedUsers.map((person) => (
                      <button
                        key={person}
                        type="button"
                        onClick={() => handleSalesPersonToggle(person)}
                        data-testid={`button-person-${person}`}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          formData.salesPersons.includes(person)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                        }`}
                      >
                        {person}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="meetingMode">Mode of Meeting</Label>
                  <Select value={formData.meetingMode} onValueChange={(value) => setFormData({ ...formData, meetingMode: value })}>
                    <SelectTrigger id="meetingMode" data-testid="select-meeting-mode">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On-Site">On-Site / Office Visit</SelectItem>
                      <SelectItem value="Online">Online Call / Google Meet / Zoom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Business Overview */}
            <div className="pt-0">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">Business Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="businessOverview">Brief Overview of Client Business</Label>
                  <Textarea
                    id="businessOverview"
                    data-testid="textarea-business-overview"
                    value={formData.businessOverview}
                    onChange={(e) => setFormData({ ...formData, businessOverview: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industryType">Industry Type</Label>
                  <Input
                    id="industryType"
                    data-testid="input-industry-type"
                    value={formData.industryType}
                    onChange={(e) => setFormData({ ...formData, industryType: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Client Requirements */}
            <div className="pt-0">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">Client Requirement Details</h3>

              {/* Problems */}
              <div className="space-y-3 mb-6">
                <Label>A. What problems are they facing?</Label>
                <div className="flex gap-2">
                  <Input
                    data-testid="input-problem"
                    placeholder="Enter problem"
                    value={currentProblem}
                    onChange={(e) => setCurrentProblem(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddProblem();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddProblem} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.problems.map((problem, idx) => (
                    <div
                      key={idx}
                      data-testid={`badge-problem-${idx}`}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      {problem}
                      <button
                        type="button"
                        onClick={() => handleRemoveProblem(idx)}
                        className="cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-3 mb-6">
                <Label>B. Requirements they need</Label>
                <div className="flex gap-2">
                  <Input
                    data-testid="input-requirement"
                    placeholder="Enter requirement"
                    value={currentRequirement}
                    onChange={(e) => setCurrentRequirement(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddRequirement} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.map((req, idx) => (
                    <div
                      key={idx}
                      data-testid={`badge-requirement-${idx}`}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      {req}
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(idx)}
                        className="cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div className="space-y-3 mb-6">
                <Label>Services Required</Label>
                <div className="flex flex-wrap gap-3">
                  {serviceOptions.map((service) => (
                    <button
                      key={service.value}
                      type="button"
                      onClick={() => handleServiceToggle(service.value)}
                      data-testid={`button-service-${service.value}`}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        formData.services.includes(service.value)
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-600'
                      }`}
                    >
                      {service.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Technical Requirements */}
              <div className="space-y-3 mb-6">
                <Label>C. Technical Requirements</Label>
                <div className="flex gap-2">
                  <Input
                    data-testid="input-tech-req"
                    placeholder="Enter technical requirement"
                    value={currentTechReq}
                    onChange={(e) => setCurrentTechReq(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTechReq();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTechReq} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.technicalRequirements.map((req, idx) => (
                    <div
                      key={idx}
                      data-testid={`badge-tech-req-${idx}`}
                      className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      {req}
                      <button
                        type="button"
                        onClick={() => handleRemoveTechReq(idx)}
                        className="cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Notes */}
              <div className="space-y-2">
                <Label htmlFor="customNotes">Custom Requirement Notes</Label>
                <Textarea
                  id="customNotes"
                  data-testid="textarea-custom-notes"
                  value={formData.customNotes}
                  onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            {/* Budget & Timeline */}
            <div className="pt-0">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">Budget & Timeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedBudget">Expected Budget Range</Label>
                  <Input
                    id="expectedBudget"
                    data-testid="input-budget"
                    value={formData.expectedBudget}
                    onChange={(e) => setFormData({ ...formData, expectedBudget: e.target.value })}
                    placeholder="e.g., 5 - 10 Lakhs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectTimeline">Project Timeline Expectation</Label>
                  <Input
                    id="projectTimeline"
                    data-testid="input-timeline"
                    value={formData.projectTimeline}
                    onChange={(e) => setFormData({ ...formData, projectTimeline: e.target.value })}
                    placeholder="e.g., 3-6 months"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="decisionMaker">Decision Maker for Final Approval</Label>
                  <Input
                    id="decisionMaker"
                    data-testid="input-decision-maker"
                    value={formData.decisionMaker}
                    onChange={(e) => setFormData({ ...formData, decisionMaker: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgencyLevel">Urgency Level</Label>
                  <Select value={formData.urgencyLevel} onValueChange={(value) => setFormData({ ...formData, urgencyLevel: value })}>
                    <SelectTrigger id="urgencyLevel" data-testid="select-urgency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Follow-up & Next Steps */}
            <div className="pt-0 pb-0">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">Follow-up & Next Steps</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nextFollowUpDate">Next Follow-up Date</Label>
                  <Input
                    id="nextFollowUpDate"
                    data-testid="input-followup-date"
                    type="date"
                    value={formData.nextFollowUpDate}
                    onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextAction">Next Action</Label>
                  <Select value={formData.nextAction} onValueChange={(value) => setFormData({ ...formData, nextAction: value })}>
                    <SelectTrigger id="nextAction" data-testid="select-next-action">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prepare quotation">Prepare quotation</SelectItem>
                      <SelectItem value="Prepare demo">Prepare demo</SelectItem>
                      <SelectItem value="Send proposal">Send proposal</SelectItem>
                      <SelectItem value="Follow-up call">Follow-up call</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button type="submit" data-testid="button-register-client" className="w-full mt-6">
              Register Client
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
