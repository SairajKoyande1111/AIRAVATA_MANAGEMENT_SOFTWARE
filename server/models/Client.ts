import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  // Basic Information
  companyName: string;
  clientName: string;
  designation: string;
  phone: string;
  email: string;
  companyAddress: string;

  // Meeting Information
  meetingDate: Date;
  meetingTime: string;
  meetingLocation: string;
  salesPersons: string[];
  meetingMode: 'On-Site' | 'Online';

  // Business Overview
  businessOverview: string;
  industryType: string;

  // Client Requirements
  problems: string[];
  requirements: string[];
  technicalRequirements: string[];
  customNotes: string;

  // Services (multiple can be selected)
  services: ('WEBSITE' | 'MOBILE APP' | 'CUSTOM SOFTWARE' | 'DIGITAL MARKETING' | 'OTHERS')[];

  // Budget & Timeline
  expectedBudget: string;
  projectTimeline: string;
  decisionMaker: string;
  urgencyLevel: 'Low' | 'Medium' | 'High';

  // Follow-up
  nextFollowUpDate: Date;
  nextAction: 'Prepare quotation' | 'Prepare demo' | 'Send proposal' | 'Follow-up call' | 'Other';

  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    companyAddress: {
      type: String,
      trim: true,
    },
    meetingDate: {
      type: Date,
    },
    meetingTime: {
      type: String,
      trim: true,
    },
    meetingLocation: {
      type: String,
      trim: true,
    },
    salesPersons: {
      type: [String],
      default: [],
    },
    meetingMode: {
      type: String,
      enum: ['On-Site', 'Online'],
    },
    businessOverview: {
      type: String,
      trim: true,
    },
    industryType: {
      type: String,
      trim: true,
    },
    problems: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    technicalRequirements: {
      type: [String],
      default: [],
    },
    customNotes: {
      type: String,
      trim: true,
    },
    services: {
      type: [String],
      enum: ['WEBSITE', 'MOBILE APP', 'CUSTOM SOFTWARE', 'DIGITAL MARKETING', 'OTHERS'],
      default: [],
    },
    expectedBudget: {
      type: String,
      trim: true,
    },
    projectTimeline: {
      type: String,
      trim: true,
    },
    decisionMaker: {
      type: String,
      trim: true,
    },
    urgencyLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    nextFollowUpDate: {
      type: Date,
    },
    nextAction: {
      type: String,
      enum: ['Prepare quotation', 'Prepare demo', 'Send proposal', 'Follow-up call', 'Other'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IClient>('Client', ClientSchema);
