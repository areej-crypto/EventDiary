import mongoose from 'mongoose';

const moderationSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },        // email of the user who posted
  postText:  { type: String, required: true },        // original text content
  message:   { type: String, default: 'Removed for offensive content' },
  createdAt: { type: Date, default: Date.now },
  acknowledged:{ type: Boolean, default: false },
}, { versionKey: false });

const ModerationModel = mongoose.model('Moderation', moderationSchema, 'Moderations');
export default ModerationModel;