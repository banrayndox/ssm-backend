import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  semester: { type: Number, required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  CR: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  total: {type: Number}
}, { timestamps: true });

export default mongoose.model('Section', SectionSchema);
