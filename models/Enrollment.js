import mongoose from "mongoose";

const EnrollmentSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true},
    section: { type: String, required: true},
    type: { type: String, enum:["regular", "retake"], default: "regular", required: true}, 
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    crId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    passKey: { type: String, required: true, unique: true }, 
  },
  { timestamps: true }
);
EnrollmentSchema.index({courseId: 1, section: 1, type: 1}, {unique: true})

const Enrollment = mongoose.model("Enrollment", EnrollmentSchema);
export default Enrollment;
