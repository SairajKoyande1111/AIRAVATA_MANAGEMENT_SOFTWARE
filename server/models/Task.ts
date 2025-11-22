import mongoose, { Schema, Document } from 'mongoose';

interface INote {
  content: string;
  date: Date;
}

interface ITask extends Document {
  title: string;
  description: string;
  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'started' | 'working' | 'pause' | 'completed' | 'approved';
  pauseReason?: string;
  notes: INote[];
  isApproved: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'started', 'working', 'pause', 'completed', 'approved'],
      default: 'pending',
    },
    pauseReason: { type: String },
    notes: [
      {
        content: { type: String, required: true },
        date: { type: Date, required: true },
      },
    ],
    isApproved: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', taskSchema);
