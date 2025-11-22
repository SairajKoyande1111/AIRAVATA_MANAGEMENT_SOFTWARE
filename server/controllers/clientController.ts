import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Client from '../models/Client';

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const {
      companyName,
      clientName,
      designation,
      phone,
      email,
      companyAddress,
      meetingDate,
      meetingTime,
      meetingLocation,
      salesPersons,
      meetingMode,
      businessOverview,
      industryType,
      problems,
      requirements,
      technicalRequirements,
      customNotes,
      services,
      expectedBudget,
      projectTimeline,
      decisionMaker,
      urgencyLevel,
      nextFollowUpDate,
      nextAction,
    } = req.body;

    // Validate required fields only
    if (!companyName || !clientName || !phone || !email) {
      return res.status(400).json({ error: 'Company Name, Client Name, Phone, and Email are required' });
    }

    const client = new Client({
      companyName: companyName || 'NA',
      clientName: clientName || 'NA',
      designation: designation || 'NA',
      phone: phone || 'NA',
      email: email || 'NA',
      companyAddress: companyAddress || 'NA',
      meetingDate: meetingDate || null,
      meetingTime: meetingTime || 'NA',
      meetingLocation: meetingLocation || 'NA',
      salesPersons: salesPersons && salesPersons.length > 0 ? salesPersons : [],
      meetingMode: meetingMode || 'NA',
      businessOverview: businessOverview || 'NA',
      industryType: industryType || 'NA',
      problems: problems && problems.length > 0 ? problems : [],
      requirements: requirements && requirements.length > 0 ? requirements : [],
      technicalRequirements: technicalRequirements && technicalRequirements.length > 0 ? technicalRequirements : [],
      customNotes: customNotes || 'NA',
      services: services && services.length > 0 ? services : [],
      expectedBudget: expectedBudget || 'NA',
      projectTimeline: projectTimeline || 'NA',
      decisionMaker: decisionMaker || 'NA',
      urgencyLevel: urgencyLevel || 'Medium',
      nextFollowUpDate: nextFollowUpDate || null,
      nextAction: nextAction || 'NA',
      createdBy: req.userId,
    });

    await client.save();

    res.status(201).json({
      message: 'Client created successfully',
      client,
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Server error creating client' });
  }
};

export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const clients = await Client.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Server error fetching clients' });
  }
};

export const getClientById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id)
      .populate('createdBy', 'name email');

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ client });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Server error fetching client' });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const client = await Client.findByIdAndUpdate(id, updateData, { new: true })
      .populate('createdBy', 'name email');

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({
      message: 'Client updated successfully',
      client,
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Server error updating client' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({
      message: 'Client deleted successfully',
      client,
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Server error deleting client' });
  }
};
