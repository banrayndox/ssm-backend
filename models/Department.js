import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Computer Science & Engineering
      unique: true,
    },

    code: {
      type: String,
      required: true, // CSE
      unique: true,
    }
  },
  { timestamps: true }
);

const Department = mongoose.model("Department", DepartmentSchema);
export default Department