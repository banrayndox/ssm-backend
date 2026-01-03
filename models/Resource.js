import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  url: { type: String, required: true }, 
  type: { 
    type: String, 
    enum: ["video", "article", "pdf", "slide", "other"],
    default: "other"
  }
}, { _id: false });
export default Resource = mongoose.model("Resource", resourceSchema)