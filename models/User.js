import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },

    role: {
      type: String,
      enum: ["student", "teacher", "authority"],
      default: "student",
    },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" }], // student courses
    createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" }], // teacher courses

    studentId: String,
    teacherId: String,
    teacherInitial: String,
    departmentId: {type: mongoose.Schema.Types.ObjectId, ref:"Department"},
    phone: Number,
    roomNo: String,
    address: String,

  },
  { timestamps: true }
);
const User = mongoose.model("User", UserSchema);
export default User