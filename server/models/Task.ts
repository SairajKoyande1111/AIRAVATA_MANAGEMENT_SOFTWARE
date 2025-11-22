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
  status: 'started' | 'working' | 'pause' | 'completed';
  pauseReason?: string;
  notes: INote[];
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
      enum: ['started', 'working', 'pause', 'completed'],
      default: 'started',
    },
    pauseReason: { type: String },
    notes: [
      {
        content: { type: String, required: true },
        date: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', taskSchema);
