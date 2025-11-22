import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import FollowUp from '../models/FollowUp';
import Lead from '../models/Lead';

export const createFollowUp = async (req: AuthRequest, res: Response) => {
  try {
    const { id: leadId } = req.params;
    const { followUpDate, outcome, nextFollowUpDate, meetingPurpose, attachments } = req.body;

    if (!followUpDate || !outcome) {
      return res.status(400).json({ error: 'followUpDate and outcome are required' });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const followUp = new FollowUp({
      leadId,
      userId: req.userId,
      followUpDate,
      outcome,
      nextFollowUpDate,
      meetingPurpose,
      attachments: attachments || [],
    });

    await followUp.save();

    if (nextFollowUpDate) {
      lead.nextFollowUp = new Date(nextFollowUpDate);
      await lead.save();
    }

    res.status(201).json({
      message: 'Follow-up created successfully',
      followUp,
    });
  } catch (error) {
    console.error('Create follow-up error:', error);
    res.status(500).json({ error: 'Server error creating follow-up' });
  }
};

export const getFollowUpsByLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id: leadId } = req.params;

    const followUps = await FollowUp.find({ leadId })
      .populate('userId', 'name email')
      .sort({ followUpDate: -1 });

    res.json({ followUps });
  } catch (error) {
    console.error('Get follow-ups error:', error);
    res.status(500).json({ error: 'Server error fetching follow-ups' });
  }
};

export const getDueFollowUps = async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter required' });
    }

    const targetDate = new Date(date as string);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const leads = await Lead.find({
      nextFollowUp: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate('clientId', 'name email phone')
      .populate('assignedTo', 'name email');

    res.json({ leads });
  } catch (error) {
    console.error('Get due follow-ups error:', error);
    res.status(500).json({ error: 'Server error fetching due follow-ups' });
  }
};
