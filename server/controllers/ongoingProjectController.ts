import { Request, Response } from 'express';
import OngoingProject from '../models/OngoingProject';
import Project from '../models/Project';

const TEAM_MEMBERS = ['Aniket', 'Sairaj', 'Sejal', 'Pratik', 'Abhijeet'];

export const createOngoingProject = async (req: Request, res: Response) => {
  try {
    const { projectId, assignedTeamMembers, startDate, endDate, status } = req.body;
    const userId = (req as any).user?._id || (req as any).user?.id;

    if (!projectId || !assignedTeamMembers || assignedTeamMembers.length === 0) {
      return res.status(400).json({ error: 'Project and team members are required' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const ongoingProject = new OngoingProject({
      projectId,
      projectName: project.projectName,
      clientId: project.clientId,
      assignedTeamMembers,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || 'Not Started',
      createdBy: userId,
    });

    await ongoingProject.save();
    res.status(201).json({ success: true, ongoingProject });
  } catch (error) {
    console.error('Error creating ongoing project:', error);
    res.status(500).json({ error: 'Failed to create ongoing project' });
  }
};

export const getOngoingProjects = async (req: Request, res: Response) => {
  try {
    const ongoingProjects = await OngoingProject.find().sort({ createdAt: -1 });
    res.json({ ongoingProjects });
  } catch (error) {
    console.error('Error fetching ongoing projects:', error);
    res.status(500).json({ error: 'Failed to fetch ongoing projects' });
  }
};

export const updateOngoingProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedTeamMembers, startDate, endDate, status } = req.body;

    const ongoingProject = await OngoingProject.findByIdAndUpdate(
      id,
      {
        assignedTeamMembers,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
      },
      { new: true }
    );

    if (!ongoingProject) {
      return res.status(404).json({ error: 'Ongoing project not found' });
    }

    res.json({ success: true, ongoingProject });
  } catch (error) {
    console.error('Error updating ongoing project:', error);
    res.status(500).json({ error: 'Failed to update ongoing project' });
  }
};

export const deleteOngoingProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await OngoingProject.findByIdAndDelete(id);
    res.json({ success: true, message: 'Ongoing project deleted' });
  } catch (error) {
    console.error('Error deleting ongoing project:', error);
    res.status(500).json({ error: 'Failed to delete ongoing project' });
  }
};

export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    res.json({ teamMembers: TEAM_MEMBERS });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
};

export const getAvailableProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find({ projectStatus: { $in: ['Not Started', 'In Progress'] } }).select(
      '_id projectId projectName clientId'
    );
    res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};
