import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, default: 'student' },
  studentId: { type: String},
  teacherId: {type:String},
  teacherInitial: {type: String},
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null , required: false},
  reqToJoinSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null },
  semester: { type: Number },
  assignedCourses: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' }
    }
  ],
  roomNo: {type: String},
  address: {type: String},
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
