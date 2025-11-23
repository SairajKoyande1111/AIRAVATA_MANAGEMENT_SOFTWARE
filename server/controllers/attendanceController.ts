import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Attendance from '../models/Attendance';

const formatDate = (date: Date): string => {
  // Convert to IST (UTC+5:30)
  const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  return istDate.toISOString().split('T')[0];
};

const calculateTotalWorkMinutes = (clockIn: Date, clockOut: Date, breakStart?: Date, breakEnd?: Date): number => {
  let totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
  
  if (breakStart && breakEnd) {
    const breakMinutes = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
    totalMinutes -= breakMinutes;
  }
  
  return Math.floor(totalMinutes);
};

export const clockIn = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const today = formatDate(new Date());

    const existingAttendance = await Attendance.findOne({ userId, date: today });
    if (existingAttendance && existingAttendance.clockIn) {
      return res.status(400).json({ error: 'Already clocked in today' });
    }

    const clockInTime = new Date();

    const attendance = existingAttendance || new Attendance({ userId, date: today });
    attendance.clockIn = clockInTime;
    await attendance.save();

    res.json({
      message: 'Clocked in successfully',
      attendance,
    });
  } catch (error) {
    console.error('Clock-in error:', error);
    res.status(500).json({ error: 'Server error during clock-in' });
  }
};

export const breakStart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const today = formatDate(new Date());

    const attendance = await Attendance.findOne({ userId, date: today });
    if (!attendance || !attendance.clockIn) {
      return res.status(400).json({ error: 'Must clock in before taking a break' });
    }

    if (attendance.breakStart) {
      return res.status(400).json({ error: 'Break already started' });
    }

    const breakStartTime = new Date();
    attendance.breakStart = breakStartTime;
    await attendance.save();

    res.json({
      message: 'Break started successfully',
      attendance,
    });
  } catch (error) {
    console.error('Break start error:', error);
    res.status(500).json({ error: 'Server error during break start' });
  }
};

export const breakEnd = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const today = formatDate(new Date());

    const attendance = await Attendance.findOne({ userId, date: today });
    if (!attendance || !attendance.breakStart) {
      return res.status(400).json({ error: 'Break not started' });
    }

    if (attendance.breakEnd) {
      return res.status(400).json({ error: 'Break already ended' });
    }

    const breakEndTime = new Date();
    const breakDuration = (breakEndTime.getTime() - attendance.breakStart.getTime()) / (1000 * 60);
    
    if (breakDuration > 60) {
      return res.status(400).json({ error: 'Break duration cannot exceed 60 minutes' });
    }

    attendance.breakEnd = breakEndTime;
    await attendance.save();

    res.json({
      message: 'Break ended successfully',
      attendance,
    });
  } catch (error) {
    console.error('Break end error:', error);
    res.status(500).json({ error: 'Server error during break end' });
  }
};

export const clockOut = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const today = formatDate(new Date());

    const attendance = await Attendance.findOne({ userId, date: today });
    if (!attendance || !attendance.clockIn) {
      return res.status(400).json({ error: 'Must clock in before clocking out' });
    }

    if (attendance.clockOut) {
      return res.status(400).json({ error: 'Already clocked out' });
    }

    if (attendance.breakStart && !attendance.breakEnd) {
      return res.status(400).json({ error: 'Must end break before clocking out' });
    }

    const clockOutTime = new Date();
    attendance.clockOut = clockOutTime;
    attendance.totalWorkMinutes = calculateTotalWorkMinutes(
      attendance.clockIn,
      clockOutTime,
      attendance.breakStart,
      attendance.breakEnd
    );

    await attendance.save();

    res.json({
      message: 'Clocked out successfully',
      attendance,
    });
  } catch (error) {
    console.error('Clock-out error:', error);
    res.status(500).json({ error: 'Server error during clock-out' });
  }
};

export const getAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter required' });
    }

    const attendance = await Attendance.find({ date: date as string })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ attendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Server error fetching attendance' });
  }
};

export const getUserAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const attendance = await Attendance.find({ userId })
      .populate('userId', 'name email')
      .sort({ date: -1 });

    res.json({ attendance });
  } catch (error) {
    console.error('Get user attendance error:', error);
    res.status(500).json({ error: 'Server error fetching user attendance' });
  }
};

export const getAttendanceSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter required' });
    }

    const attendance = await Attendance.find({ date: date as string })
      .populate('userId', 'name email');

    const summary = attendance.map(record => ({
      user: record.userId,
      date: record.date,
      clockIn: record.clockIn,
      clockOut: record.clockOut,
      totalWorkMinutes: record.totalWorkMinutes,
      breakDuration: record.breakStart && record.breakEnd 
        ? (record.breakEnd.getTime() - record.breakStart.getTime()) / (1000 * 60)
        : 0,
    }));

    res.json({ summary });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ error: 'Server error fetching attendance summary' });
  }
};

export const resetTodayAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const today = formatDate(new Date());

    const attendance = await Attendance.findOne({ userId, date: today });
    if (!attendance) {
      return res.status(400).json({ error: 'No attendance record found for today' });
    }

    await Attendance.deleteOne({ userId, date: today });

    res.json({ message: 'Today\'s attendance has been reset successfully' });
  } catch (error) {
    console.error('Reset attendance error:', error);
    res.status(500).json({ error: 'Server error resetting attendance' });
  }
};
