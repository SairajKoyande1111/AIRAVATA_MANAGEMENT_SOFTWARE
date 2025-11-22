import mongoose, { Schema, Document } from 'mongoose';

interface INote {
  content: string;
  date: Date;
}

interface ITaskArchive extends Document {
  originalTaskId: mongoose.Types.ObjectId;
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
  taskCreatedAt: Date;
  archivedAt: Date;
}

const taskArchiveSchema = new Schema<ITaskArchive>(
  {
    originalTaskId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'started', 'working', 'pause', 'completed', 'approved'],
      required: true,
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
    taskCreatedAt: { type: Date, required: true },
    archivedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

export default mongoose.model<ITaskArchive>('TaskArchive', taskArchiveSchema);
