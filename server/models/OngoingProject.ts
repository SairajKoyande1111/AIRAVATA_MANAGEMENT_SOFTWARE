import mongoose, { Schema, Document } from 'mongoose';

export interface IOngoingProject extends Document {
  projectId: mongoose.Types.ObjectId;
  projectName: string;
  clientId: string;
  assignedTeamMembers: string[];
  startDate: Date;
  endDate: Date;
  status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OngoingProjectSchema = new Schema<IOngoingProject>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    clientId: {
      type: String,
      required: true,
    },
    assignedTeamMembers: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one team member must be assigned',
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'On Hold', 'Completed'],
      default: 'Not Started',
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

export default mongoose.model<IOngoingProject>('OngoingProject', OngoingProjectSchema);
