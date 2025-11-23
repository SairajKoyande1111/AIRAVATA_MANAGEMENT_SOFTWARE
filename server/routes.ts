import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Project from '../models/Project';

// Generate unique project ID
const generateProjectId = async (): Promise<string> => {
  const count = await Project.countDocuments();
  return `PROJ-${Date.now()}-${count + 1}`;
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const {
      projectName,
      clientId,
      clientContactPerson,
      clientMobileNumber,
      clientEmail,
      projectType,
      projectDescription,
      startDate,
      expectedEndDate,
      projectLead,
      priorityLevel,
      teamMembers,
    } = req.body;

    if (!projectName || !clientId || !clientContactPerson || !clientMobileNumber || !clientEmail || !projectType || !startDate || !expectedEndDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const projectId = await generateProjectId();

    const project = new Project({
      projectName,
      projectId,
      clientId,
      clientContactPerson,
      clientMobileNumber,
      clientEmail,
      projectType,
      projectDescription,
      startDate,
      expectedEndDate,
      projectLead: projectLead || req.userId,
      priorityLevel: priorityLevel || 'Medium',
      teamMembers: teamMembers || [],
      createdBy: req.userId,
    });

    await project.save();
    await project.populate('clientId', 'companyName');
    await project.populate('projectLead', 'email');
    await project.populate('teamMembers.userId', 'email');

    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error creating project' });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find()
      .populate('clientId', 'companyName')
      .populate('projectLead', 'email')
      .populate('teamMembers.userId', 'email')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error fetching projects' });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('clientId')
      .populate('projectLead', 'email')
      .populate('teamMembers.userId', 'email')
      .populate('tasks.assignedTo', 'email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error fetching project' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Calculate project duration if dates are provided
    if (updateData.startDate || updateData.expectedEndDate || updateData.actualEndDate) {
      const project = await Project.findById(id);
      if (project) {
        const start = new Date(updateData.startDate || project.startDate);
        const end = new Date(updateData.actualEndDate || updateData.expectedEndDate || project.expectedEndDate);
        const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        updateData.projectDuration = duration;
      }
    }

    const project = await Project.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('clientId')
      .populate('projectLead', 'email')
      .populate('teamMembers.userId', 'email')
      .populate('tasks.assignedTo', 'email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error updating project' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error deleting project' });
  }
};

// Add task to project
export const addTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const taskData = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.tasks.push(taskData);
    await project.save();
    await project.populate('tasks.assignedTo', 'email');

    res.json({
      message: 'Task added successfully',
      project,
    });
  } catch (error) {
    console.error('Add task error:', error);
    res.status(500).json({ error: 'Server error adding task' });
  }
};

// Update task in project
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id, taskId } = req.params;
    const updateData = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    Object.assign(task, updateData);
    await project.save();
    await project.populate('tasks.assignedTo', 'email');

    res.json({
      message: 'Task updated successfully',
      project,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error updating task' });
  }
};

// Delete task from project
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id, taskId } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.tasks.id(taskId)?.deleteOne();
    await project.save();

    res.json({
      message: 'Task deleted successfully',
      project,
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error deleting task' });
  }
};

// Add milestone
export const addMilestone = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const milestoneData = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.milestones.push(milestoneData);
    await project.save();

    res.json({
      message: 'Milestone added successfully',
      project,
    });
  } catch (error) {
    console.error('Add milestone error:', error);
    res.status(500).json({ error: 'Server error adding milestone' });
  }
};
