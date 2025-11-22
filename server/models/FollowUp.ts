import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowUp extends Document {
  leadId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  followUpDate: Date;
  outcome: string;
  nextFollowUpDate?: Date;
  meetingPurpose?: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    followUpDate: {
      type: Date,
      required: true,
    },
    outcome: {
      type: String,
      required: true,
    },
    nextFollowUpDate: {
      type: Date,
    },
    meetingPurpose: {
      type: String,
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);
