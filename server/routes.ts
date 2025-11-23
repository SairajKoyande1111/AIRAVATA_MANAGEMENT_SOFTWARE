import type { Express } from "express";
import { createServer, type Server } from "http";
import { authenticateToken } from "./middleware/auth";
import * as authController from "./controllers/authController";
import * as attendanceController from "./controllers/attendanceController";
import * as clientController from "./controllers/clientController";
import * as leadController from "./controllers/leadController";
import * as followUpController from "./controllers/followUpController";
import * as reportController from "./controllers/reportController";
import * as taskController from "./controllers/taskController";
import * as taskArchiveController from "./controllers/taskArchiveController";
import * as userController from "./controllers/userController";
import * as projectController from "./controllers/projectController";
import * as ongoingProjectController from "./controllers/ongoingProjectController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes (public)
  app.post("/api/auth/register", authController.register);
  app.post("/api/auth/login", authController.login);

  // Attendance routes (protected)
  app.post("/api/attendance/clockin", authenticateToken, attendanceController.clockIn);
  app.post("/api/attendance/break/start", authenticateToken, attendanceController.breakStart);
  app.post("/api/attendance/break/end", authenticateToken, attendanceController.breakEnd);
  app.post("/api/attendance/clockout", authenticateToken, attendanceController.clockOut);
  app.post("/api/attendance/reset-today", authenticateToken, attendanceController.resetTodayAttendance);
  app.get("/api/attendance", authenticateToken, attendanceController.getAttendance);
  app.get("/api/attendance/user/:userId", authenticateToken, attendanceController.getUserAttendance);
  app.get("/api/attendance/summary", authenticateToken, attendanceController.getAttendanceSummary);

  // Client routes (protected)
  app.post("/api/clients", authenticateToken, clientController.createClient);
  app.get("/api/clients", authenticateToken, clientController.getClients);
  app.get("/api/clients/:id", authenticateToken, clientController.getClientById);
  app.put("/api/clients/:id", authenticateToken, clientController.updateClient);
  app.delete("/api/clients/:id", authenticateToken, clientController.deleteClient);

  // Lead routes (protected)
  app.post("/api/leads", authenticateToken, leadController.createLead);
  app.get("/api/leads", authenticateToken, leadController.getLeads);
  app.get("/api/leads/:id", authenticateToken, leadController.getLeadById);
  app.put("/api/leads/:id", authenticateToken, leadController.updateLead);

  // Follow-up routes (protected)
  app.post("/api/leads/:id/followups", authenticateToken, followUpController.createFollowUp);
  app.get("/api/leads/:id/followups", authenticateToken, followUpController.getFollowUpsByLead);
  app.get("/api/followups/due", authenticateToken, followUpController.getDueFollowUps);

  // Reports routes (protected)
  app.get("/api/reports/funnel", authenticateToken, reportController.getFunnelReport);
  app.get("/api/reports/followups/due", authenticateToken, reportController.getFollowUpsDueReport);

  // Task routes (protected)
  app.get("/api/tasks", authenticateToken, taskController.getTasks);
  app.post("/api/tasks", authenticateToken, taskController.createTask);
  app.put("/api/tasks/:taskId/status", authenticateToken, taskController.updateTaskStatus);
  app.post("/api/tasks/:taskId/notes", authenticateToken, taskController.addNote);
  app.delete("/api/tasks/:taskId", authenticateToken, taskController.deleteTask);
  app.post("/api/tasks/:taskId/approve", authenticateToken, taskController.approveTask);
  app.post("/api/tasks/archive/daily", authenticateToken, taskArchiveController.archiveDailyTasks);
  app.get("/api/tasks/archive/all", authenticateToken, taskArchiveController.getAllArchives);
  app.get("/api/tasks/archive/by-date", authenticateToken, taskArchiveController.getArchiveByDate);

  // User routes (protected)
  app.get("/api/users", authenticateToken, userController.getUsers);

  // Project routes (protected)
  app.post("/api/projects", authenticateToken, projectController.createProject);
  app.get("/api/projects", authenticateToken, projectController.getProjects);
  app.get("/api/projects/:id", authenticateToken, projectController.getProjectById);
  app.put("/api/projects/:id", authenticateToken, projectController.updateProject);
  app.delete("/api/projects/:id", authenticateToken, projectController.deleteProject);
  app.post("/api/projects/:id/tasks", authenticateToken, projectController.addTask);
  app.put("/api/projects/:id/tasks/:taskId", authenticateToken, projectController.updateTask);
  app.delete("/api/projects/:id/tasks/:taskId", authenticateToken, projectController.deleteTask);
  app.post("/api/projects/:id/milestones", authenticateToken, projectController.addMilestone);

  // Ongoing Project routes (protected)
  app.get("/api/ongoing-projects/team-members", authenticateToken, ongoingProjectController.getTeamMembers);
  app.get("/api/ongoing-projects/available-projects", authenticateToken, ongoingProjectController.getAvailableProjects);
  app.post("/api/ongoing-projects", authenticateToken, ongoingProjectController.createOngoingProject);
  app.get("/api/ongoing-projects", authenticateToken, ongoingProjectController.getOngoingProjects);
  app.put("/api/ongoing-projects/:id", authenticateToken, ongoingProjectController.updateOngoingProject);
  app.delete("/api/ongoing-projects/:id", authenticateToken, ongoingProjectController.deleteOngoingProject);

  const httpServer = createServer(app);

  return httpServer;
}
