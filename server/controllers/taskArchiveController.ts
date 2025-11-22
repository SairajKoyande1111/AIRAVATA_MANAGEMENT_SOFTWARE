import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import TaskArchive from '../models/TaskArchive';

export const archiveDailyTasks = async (req: AuthRequest, res: Response) => {
  try {
    // Only archive completed and approved tasks
    const tasksToArchive = await Task.find({ status: { $in: ['completed', 'approved'] } })
      .populate('assignedTo', 'email name')
      .populate('assignedBy', 'email name')
      .populate('approvedBy', 'email name');

    if (tasksToArchive.length === 0) {
      return res.json({ message: 'No completed or approved tasks to archive', archivedCount: 0 });
    }

    // Create archive records for each completed/approved task
    const archiveRecords = tasksToArchive.map(task => ({
      originalTaskId: task._id,
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      assignedBy: task.assignedBy,
      status: task.status,
      pauseReason: task.pauseReason,
      notes: task.notes,
      isApproved: task.isApproved,
      approvedBy: task.approvedBy,
      approvedAt: task.approvedAt,
      taskCreatedAt: task.createdAt,
      archivedAt: new Date(),
    }));

    await TaskArchive.insertMany(archiveRecords);

    // Delete only completed and approved tasks after archiving
    await Task.deleteMany({ status: { $in: ['completed', 'approved'] } });

    res.json({ 
      message: 'Tasks archived successfully', 
      archivedCount: tasksToArchive.length 
    });
  } catch (error) {
    console.error('Archive tasks error:', error);
    res.status(500).json({ error: 'Server error archiving tasks' });
  }
};

export const getArchiveByDate = async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;

    let query: any = {};

    if (date) {
      const dateObj = new Date(date as string);
      const startDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      query.archivedAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const archives = await TaskArchive.find(query)
      .populate('assignedTo', 'email name')
      .populate('assignedBy', 'email name')
      .populate('approvedBy', 'email name')
      .sort({ archivedAt: -1 });

    res.json({ archives });
  } catch (error) {
    console.error('Get archive error:', error);
    res.status(500).json({ error: 'Server error fetching archives' });
  }
};

export const getAllArchives = async (req: AuthRequest, res: Response) => {
  try {
    const archives = await TaskArchive.find()
      .populate('assignedTo', 'email name')
      .populate('assignedBy', 'email name')
      .populate('approvedBy', 'email name')
      .sort({ archivedAt: -1 });

    // Group by archive date in IST
    const groupedByDate: { [key: string]: any[] } = {};

    archives.forEach(archive => {
      // Convert to IST (UTC+5:30) for proper date grouping
      const istDate = new Date(archive.archivedAt.getTime() + (5.5 * 60 * 60 * 1000));
      const dateKey = istDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(archive);
    });

    res.json({ archives: groupedByDate, totalArchives: archives.length });
  } catch (error) {
    console.error('Get all archives error:', error);
    res.status(500).json({ error: 'Server error fetching all archives' });
  }
};
