import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  userPic: { type: String, default: null },
  textContent: { type: String, default: '' },
  image: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  editedAt: { type: Date, default: null },
  likes: {
    type: [String],
    default: []
  },
  comments: [
    {
      userName: String,
      text: String
    }
  ],
  eventId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event',
    default: null
  },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  eventType: { type: String, default: null },
  location: { type: String, default: null },
  hashtags: { type: [String], default: [] },
  eventTime: { type: String, default: null },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
}, 
{versionKey: false});

const PostModel = mongoose.model('Post', postSchema, 'Post');
export default PostModel;
