import mongoose from 'mongoose';
 
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  eventType: { type: String, required: true }, 
  location: { type: String, required: true },
  hashtags: { type: [String], default: [] }, 
  eventTime: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  organizerName: { type: String, required: true },
  organizerEmail: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  editedByUser: { type: Boolean, default: false },
  image: { type: String, default: null },
  userPic: { type: String, default: '' },
 
  likesCount: { type: Number, default: 0 },
  remindCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },

  originalData: { 
    type: mongoose.Schema.Types.Mixed, 
    default: null 
  },

  viewedByUser: {
    type: Boolean,
    default: false
  },
  hiddenFromManage: {
    type: Boolean,
    default: false
  },

  
});
 
export default mongoose.model('Event', eventSchema); 