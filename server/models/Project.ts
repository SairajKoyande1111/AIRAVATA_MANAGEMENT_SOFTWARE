import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectTask extends Document {
  taskName: string;
  assignedTo: mongoose.Types.ObjectId;
  taskDescription: string;
  taskPriority: 'Low' | 'Medium' | 'High' | 'Critical';
  startDate: Date;
  dueDate: Date;
  taskStatus: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  comments: string;
  attachments: string[];
}

export interface IMilestone extends Document {
  milestoneName: string;
  dueDate: Date;
  status: 'Not Started' | 'In Progress' | 'Completed';
  notes: string;
}

export interface ITeamMember extends Document {
  userId: mongoose.Types.ObjectId;
  role: string;
}

export interface IFinancial extends Document {
  estimatedCost: number;
  amountQuoted: number;
  amountReceived: number;
  invoiceDetails: string;
  paymentStatus: 'Pending' | 'Partial' | 'Completed';
}

export interface ITechnicalDetails extends Document {
  technologyStack: string[];
  hostingDetails: string;
  domainDetails: string;
  credentials: string;
}

export interface IDeployment extends Document {
  deploymentStatus: 'Not Started' | 'In Progress' | 'Completed';
  deploymentDate: Date;
  uatNotes: string;
  goLiveConfirmation: boolean;
  maintenancePeriod: string;
}

export interface IProject extends Document {
  projectId: string;
  clientId: string;
  projectName: string;
  clientContactPerson: string;
  clientMobileNumber: string;
  clientEmail: string;
  services: string[];
  projectType: string;
  projectDescription: string;
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  projectDuration?: number;
  projectStatus: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  priorityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  progress: number;
  stage: 'Requirement Gathering' | 'Development' | 'Testing' | 'Deployment' | 'Maintenance';
  projectLead: mongoose.Types.ObjectId;
  teamMembers: ITeamMember[];
  tasks: IProjectTask[];
  milestones: IMilestone[];
  meetingNotes: string;
  clientFeedback: string;
  internalNotes: string;
  followUps: string[];
  nextActionDate?: Date;
  uploadedFiles: string[];
  financial?: IFinancial;
  technicalDetails?: ITechnicalDetails;
  deployment?: IDeployment;
  finalRemarks?: string;
  clientApproval: boolean;
  handoverFiles: string[];
  projectRating?: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

const TaskSchema = new Schema<IProjectTask>({
  taskName: {
    type: String,
    required: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  taskDescription: {
    type: String,
  },
  taskPriority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  startDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  taskStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
    default: 'Not Started',
  },
  comments: {
    type: String,
  },
  attachments: {
    type: [String],
    default: [],
  },
});

const MilestoneSchema = new Schema<IMilestone>({
  milestoneName: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  notes: {
    type: String,
  },
});

const FinancialSchema = new Schema<IFinancial>({
  estimatedCost: {
    type: Number,
    default: 0,
  },
  amountQuoted: {
    type: Number,
    default: 0,
  },
  amountReceived: {
    type: Number,
    default: 0,
  },
  invoiceDetails: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Completed'],
    default: 'Pending',
  },
});

const TechnicalDetailsSchema = new Schema<ITechnicalDetails>({
  technologyStack: {
    type: [String],
    default: [],
  },
  hostingDetails: {
    type: String,
  },
  domainDetails: {
    type: String,
  },
  credentials: {
    type: String,
  },
});

const DeploymentSchema = new Schema<IDeployment>({
  deploymentStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  deploymentDate: {
    type: Date,
  },
  uatNotes: {
    type: String,
  },
  goLiveConfirmation: {
    type: Boolean,
    default: false,
  },
  maintenancePeriod: {
    type: String,
  },
});

const ProjectSchema = new Schema<IProject>(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    clientId: {
      type: String,
      required: true,
      unique: true,
    },
    clientContactPerson: {
      type: String,
      required: true,
    },
    clientMobileNumber: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
    },
    services: {
      type: [String],
      enum: ['Website Development', 'Mobile App Development', 'Custom Software Development', 'Digital Marketing'],
      required: true,
    },
    projectType: {
      type: String,
      required: true,
    },
    projectDescription: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    expectedEndDate: {
      type: Date,
      required: true,
    },
    actualEndDate: {
      type: Date,
    },
    projectDuration: {
      type: Number,
    },
    projectStatus: {
      type: String,
      enum: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
      default: 'Not Started',
    },
    priorityLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stage: {
      type: String,
      enum: ['Requirement Gathering', 'Development', 'Testing', 'Deployment', 'Maintenance'],
      default: 'Requirement Gathering',
    },
    projectLead: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamMembers: [TeamMemberSchema],
    tasks: [TaskSchema],
    milestones: [MilestoneSchema],
    meetingNotes: {
      type: String,
    },
    clientFeedback: {
      type: String,
    },
    internalNotes: {
      type: String,
    },
    followUps: {
      type: [String],
      default: [],
    },
    nextActionDate: {
      type: Date,
    },
    uploadedFiles: {
      type: [String],
      default: [],
    },
    financial: FinancialSchema,
    technicalDetails: TechnicalDetailsSchema,
    deployment: DeploymentSchema,
    finalRemarks: {
      type: String,
    },
    clientApproval: {
      type: Boolean,
      default: false,
    },
    handoverFiles: {
      type: [String],
      default: [],
    },
    projectRating: {
      type: Number,
      min: 1,
      max: 5,
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

export default mongoose.model<IProject>('Project', ProjectSchema);
