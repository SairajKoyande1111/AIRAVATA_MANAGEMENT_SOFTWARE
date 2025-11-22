import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Lead from '../models/Lead';

export const getFunnelReport = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to } = req.query;

    const filter: any = {};
    if (from || to) {
      filter.registeredDate = {};
      if (from) filter.registeredDate.$gte = new Date(from as string);
      if (to) filter.registeredDate.$lte = new Date(to as string);
    }

    const stages = ['new', 'contacted', 'qualified', 'proposal', 'meeting', 'negotiation', 'won', 'lost'];
    
    const funnelData = await Promise.all(
      stages.map(async (stage) => {
        const count = await Lead.countDocuments({ ...filter, stage });
        return { stage, count };
      })
    );

    const totalLeads = funnelData.reduce((sum, item) => sum + item.count, 0);

    res.json({
      funnel: funnelData,
      totalLeads,
      dateRange: { from: from || null, to: to || null },
    });
  } catch (error) {
    console.error('Get funnel report error:', error);
    res.status(500).json({ error: 'Server error fetching funnel report' });
  }
};

export const getFollowUpsDueReport = async (req: AuthRequest, res: Response) => {
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
      .populate('clientId', 'name email phone businessType')
      .populate('assignedTo', 'name email');

    res.json({
      date,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error('Get follow-ups due report error:', error);
    res.status(500).json({ error: 'Server error fetching follow-ups due report' });
  }
};
