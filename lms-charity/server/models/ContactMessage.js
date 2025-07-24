import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  email: String,
  subject: String,
  message: String,
  type: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ContactMessage', contactMessageSchema); 