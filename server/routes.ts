import type { Express } from "express";
import { createServer, type Server } from "http";
import { authenticateToken } from "./middleware/auth";
import * as authController from "./controllers/authController";
import * as attendanceController from "./controllers/attendanceController";
import * as clientController from "./controllers/clientController";
import * as leadController from "./controllers/leadController";
import * as followUpController from "./controllers/followUpController";
import * as reportController from "./controllers/reportController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes (public)
  app.post("/api/auth/register", authController.register);
  app.post("/api/auth/login", authController.login);

  // Attendance routes (protected)
  app.post("/api/attendance/clockin", authenticateToken, attendanceController.clockIn);
  app.post("/api/attendance/break/start", authenticateToken, attendanceController.breakStart);
  app.post("/api/attendance/break/end", authenticateToken, attendanceController.breakEnd);
  app.post("/api/attendance/clockout", authenticateToken, attendanceController.clockOut);
  app.get("/api/attendance", authenticateToken, attendanceController.getAttendance);
  app.get("/api/attendance/user/:userId", authenticateToken, attendanceController.getUserAttendance);
  app.get("/api/attendance/summary", authenticateToken, attendanceController.getAttendanceSummary);

  // Client routes (protected)
  app.post("/api/clients", authenticateToken, clientController.createClient);
  app.get("/api/clients", authenticateToken, clientController.getClients);
  app.get("/api/clients/:id", authenticateToken, clientController.getClientById);

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

  const httpServer = createServer(app);

  return httpServer;
}
