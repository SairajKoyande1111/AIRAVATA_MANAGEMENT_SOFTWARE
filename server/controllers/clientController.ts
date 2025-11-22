import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Client from '../models/Client';

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, businessType, location, email } = req.body;

    if (!name || !phone || !businessType || !location || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const client = new Client({
      name,
      phone,
      businessType,
      location,
      email,
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
