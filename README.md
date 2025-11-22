# Company Management System

A complete backend system for a 5-user internal company management platform with MongoDB, Node.js, Express, and JWT authentication.

## Features

- **Authentication**: JWT-based login system (max 5 users)
- **Attendance Management**: Track clock-in/out, breaks, and work hours
- **Client Management**: Store and manage client information
- **Lead Management**: Track leads through sales stages
- **Follow-up Tracking**: Schedule and record client follow-ups
- **Reports**: Funnel analysis and due follow-ups

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   The system uses the following environment variables (already configured):
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT token generation
   - `PORT`: Server port (default: 5000)

3. **Start the Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Attendance Management

#### Clock In
```bash
curl -X POST http://localhost:5000/api/attendance/clockin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Start Break
```bash
curl -X POST http://localhost:5000/api/attendance/break/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### End Break
```bash
curl -X POST http://localhost:5000/api/attendance/break/end \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Clock Out
```bash
curl -X POST http://localhost:5000/api/attendance/clockout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get Attendance by Date
```bash
curl -X GET "http://localhost:5000/api/attendance?date=2024-01-15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get User Attendance
```bash
curl -X GET http://localhost:5000/api/attendance/user/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Attendance Summary
```bash
curl -X GET "http://localhost:5000/api/attendance/summary?date=2024-01-15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Client Management

#### Create Client
```bash
curl -X POST http://localhost:5000/api/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Corporation",
    "phone": "+1234567890",
    "businessType": "Technology",
    "location": "New York, NY",
    "email": "contact@abc.com"
  }'
```

#### Get All Clients
```bash
curl -X GET http://localhost:5000/api/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Client by ID
```bash
curl -X GET http://localhost:5000/api/clients/CLIENT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Lead Management

#### Create Lead
```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "CLIENT_ID",
    "registeredDate": "2024-01-15",
    "assignedTo": "USER_ID",
    "requirementType": "Website",
    "requirementDetails": ["E-commerce platform", "Payment integration"],
    "priority": "high",
    "stage": "new",
    "estimatedBudget": 50000,
    "notes": "Initial consultation completed"
  }'
```

#### Get All Leads
```bash
curl -X GET http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Lead by ID
```bash
curl -X GET http://localhost:5000/api/leads/LEAD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update Lead
```bash
curl -X PUT http://localhost:5000/api/leads/LEAD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "qualified",
    "priority": "high",
    "notes": "Client approved budget"
  }'
```

### Follow-up Management

#### Create Follow-up
```bash
curl -X POST http://localhost:5000/api/leads/LEAD_ID/followups \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "followUpDate": "2024-01-15T10:00:00Z",
    "outcome": "Client interested, requested proposal",
    "nextFollowUpDate": "2024-01-20T14:00:00Z",
    "meetingPurpose": "Proposal presentation",
    "attachments": ["https://example.com/proposal.pdf"]
  }'
```

#### Get Follow-ups for a Lead
```bash
curl -X GET http://localhost:5000/api/leads/LEAD_ID/followups \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Due Follow-ups
```bash
curl -X GET "http://localhost:5000/api/followups/due?date=2024-01-15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Reports

#### Get Funnel Report
```bash
curl -X GET "http://localhost:5000/api/reports/funnel?from=2024-01-01&to=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Follow-ups Due Report
```bash
curl -X GET "http://localhost:5000/api/reports/followups/due?date=2024-01-15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Business Rules

### Attendance Rules
- Work session starts at 10:00 AM (cannot clock in before)
- Lunch break allowed only after 12:00 PM
- Maximum break duration: 1 hour
- Total work time automatically calculated: (clockOut - clockIn) - breakDuration

### Lead Stages
- new → contacted → qualified → proposal → meeting → negotiation → won/lost

### Requirement Types
- Website
- Mobile app
- Custom software
- Digital marketing
- Other (requires otherText field)

### Priority Levels
- low
- medium
- high

## Folder Structure

```
├── server/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.ts    # Authentication logic
│   │   ├── attendanceController.ts
│   │   ├── clientController.ts
│   │   ├── leadController.ts
│   │   ├── followUpController.ts
│   │   └── reportController.ts
│   ├── middleware/
│   │   └── auth.ts              # JWT authentication
│   ├── models/
│   │   ├── User.ts
│   │   ├── Attendance.ts
│   │   ├── Client.ts
│   │   ├── Lead.ts
│   │   └── FollowUp.ts
│   ├── routes.ts                # All API routes
│   └── app.ts                   # Express app setup
```

## Notes

- Maximum 5 users allowed (enforced at registration)
- All authenticated users can view all data (no role-based access control)
- JWT tokens expire after 30 days
- All dates should be in ISO 8601 format
- Timestamps (createdAt, updatedAt) are automatically managed by Mongoose
