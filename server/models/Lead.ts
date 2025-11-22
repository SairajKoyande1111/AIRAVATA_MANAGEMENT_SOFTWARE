import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  clientId: mongoose.Types.ObjectId;
  registeredDate: Date;
  assignedTo: string[];
  requirementType: string[];
  otherText?: string;
  requirementDetails: string[];
  priority: 'low' | 'medium' | 'high';
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'meeting' | 'negotiation' | 'won' | 'lost';
  serviceBudgets?: { [key: string]: number };
  nextFollowUp?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    registeredDate: {
      type: Date,
      required: true,
    },
    assignedTo: {
      type: [String],
      required: true,
    },
    requirementType: {
      type: [String],
      required: true,
    },
    otherText: {
      type: String,
      trim: true,
    },
    requirementDetails: {
      type: [String],
      default: [],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    stage: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'meeting', 'negotiation', 'won', 'lost'],
      default: 'new',
    },
    serviceBudgets: {
      type: Map,
      of: Number,
    },
    nextFollowUp: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILead>('Lead', LeadSchema);
