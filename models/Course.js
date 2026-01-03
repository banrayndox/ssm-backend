import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  semester: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Course', CourseSchema);
