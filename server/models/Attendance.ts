import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  clockIn?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  clockOut?: Date;
  totalWorkMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    clockIn: {
      type: Date,
    },
    breakStart: {
      type: Date,
    },
    breakEnd: {
      type: Date,
    },
    clockOut: {
      type: Date,
    },
    totalWorkMinutes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
