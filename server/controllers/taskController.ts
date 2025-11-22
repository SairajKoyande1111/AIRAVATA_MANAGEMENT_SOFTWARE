import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import User from '../models/User';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'email name')
      .populate('assignedBy', 'email name')
      .populate('approvedBy', 'email name')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error fetching tasks' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, assignedToId } = req.body;
    const userId = req.userId!;

    if (!title || !description || !assignedToId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const assignedToUser = await User.findById(assignedToId);
    if (!assignedToUser) {
      return res.status(400).json({ error: 'User not found' });
    }

    const task = new Task({
      title,
      description,
      assignedTo: assignedToId,
      assignedBy: userId,
      notes: [],
    });

    await task.save();
    await task.populate('assignedTo', 'email name');
    await task.populate('assignedBy', 'email name');
    await task.populate('approvedBy', 'email name');

    res.json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error creating task' });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status, pauseReason } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = status;
    if (status === 'pause' && pauseReason) {
      task.pauseReason = pauseReason;
    }

    await task.save();
    await task.populate('assignedTo', 'email name');
    await task.populate('assignedBy', 'email name');
    await task.populate('approvedBy', 'email name');

    res.json({ message: 'Task status updated', task });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Server error updating task' });
  }
};

export const addNote = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.notes.push({
      content,
      date: new Date(),
    });

    await task.save();
    await task.populate('assignedTo', 'email name');
    await task.populate('assignedBy', 'email name');
    await task.populate('approvedBy', 'email name');

    res.json({ message: 'Note added successfully', task });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Server error adding note' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const result = await Task.findByIdAndDelete(taskId);
    if (!result) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error deleting task' });
  }
};

export const approveTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId!;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if task is completed
    if (task.status !== 'completed') {
      return res.status(400).json({ error: 'Task must be completed before approval' });
    }

    // Check if the approver is not the task worker
    const assignedToId = task.assignedTo.toString();
    if (assignedToId === userId) {
      return res.status(400).json({ error: 'Cannot approve your own task' });
    }

    task.status = 'approved';
    task.isApproved = true;
    task.approvedBy = new (mongoose.Types.ObjectId as any)(userId);
    task.approvedAt = new Date();

    await task.save();
    await task.populate('assignedTo', 'email name');
    await task.populate('assignedBy', 'email name');
    await task.populate('approvedBy', 'email name');

    res.json({ message: 'Task approved successfully', task });
  } catch (error) {
    console.error('Approve task error:', error);
    res.status(500).json({ error: 'Server error approving task' });
  }
};
