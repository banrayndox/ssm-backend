import mongoose from "mongoose";
const CourseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true }, 

    credit: Number,

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    }
  },
  { timestamps: true }
);

CourseSchema.index({ code: 1, department: 1 }, { unique: true });

const Course = mongoose.model("Course", CourseSchema);
export default Course