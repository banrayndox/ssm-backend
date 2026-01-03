import mongoose from 'mongoose';

const CommunicationSchema = new mongoose.Schema({
  type: { type: String, enum: ['notice', 'poll', 'issue', 'task','exam'], required: true }, 
  title: { type: String , default:''}, 
  content: { type: String,default:'' },
  time: {type: String,default:''},
  duration: {type: String,default:''},
  syllabus: {type: String,default:''},
  category: {type: String,default:''},
  date: {type: String,default:''},
  dueDate: {type: String,default:''},
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: {type: mongoose.Schema.Types.ObjectId, ref:'Course'},
  isAnonymous: { type: Boolean, default: false }, 
  priority: { type: String, enum: ['low', 'medium', 'high'] }, 
  option1: {type: String,default:''},
  option1Votes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  option2: {type: String,default:''},  
  option2Votes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['resolved', 'pending'], default: 'pending' }, 
  resolvedAt: {type: Date,default:''},
 reportedAt: { type: Date, default: Date.now },
  resolvedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, { timestamps: true });

const Communication = mongoose.model('Communication', CommunicationSchema);
export default Communication