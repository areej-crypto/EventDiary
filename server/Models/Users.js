import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  uname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetCode: String, 
  resetCodeExpiration: Date,
  pic: { type: String } 
});

const UserModel = mongoose.model('User', UserSchema, 'User');

export default UserModel;
