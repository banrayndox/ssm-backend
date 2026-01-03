import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  sectionId: {type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true},
  lectureNumber: { type: Number, required: true, unique: true }, 
  topics: [{ type: String, required: true }],
//   resources: [], wait for final touch
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Lecture", lectureSchema);
