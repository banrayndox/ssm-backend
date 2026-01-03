import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model('Department', DepartmentSchema);
