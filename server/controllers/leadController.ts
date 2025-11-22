import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Lead from '../models/Lead';

export const createLead = async (req: AuthRequest, res: Response) => {
  try {
    const {
      clientId,
      registeredDate,
      assignedTo,
      requirementType,
      otherText,
      requirementDetails,
      priority,
      stage,
      serviceBudgets,
      nextFollowUp,
      notes,
    } = req.body;

    if (!clientId || !registeredDate || !assignedTo || !requirementType) {
      return res.status(400).json({ error: 'Required fields: clientId, registeredDate, assignedTo, requirementType' });
    }

    if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({ error: 'assignedTo must be a non-empty array' });
    }

    const lead = new Lead({
      clientId,
      registeredDate,
      assignedTo,
      requirementType,
      otherText,
      requirementDetails: requirementDetails || [],
      priority: priority || 'medium',
      stage: stage || 'new',
      serviceBudgets: serviceBudgets || {},
      nextFollowUp,
      notes,
    });

    await lead.save();

    res.status(201).json({
      message: 'Lead created successfully',
      lead,
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Server error creating lead' });
  }
};

export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    const leads = await Lead.find()
      .populate('clientId', 'name email phone businessType')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ leads });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Server error fetching leads' });
  }
};

export const getLeadById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id)
      .populate('clientId', 'name email phone businessType')
      .populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ lead });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Server error fetching lead' });
  }
};

export const updateLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const lead = await Lead.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('clientId', 'name email phone businessType')
      .populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({
      message: 'Lead updated successfully',
      lead,
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Server error updating lead' });
  }
};
