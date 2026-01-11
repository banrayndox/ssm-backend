import mongoose from "mongoose";

const CommunicationSchema = new mongoose.Schema(
  {

    type: {
      type: String,
      enum: ["notice", "poll", "issue", "task", "exam", "lecture"],
      required: true,
    },


    title: { type: String, default: "" },
    content: { type: String, default: "" },


    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

  option1: {type: String,default:''},
  option1Votes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  option2: {type: String,default:''},  
  option2Votes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    pollExpiresAt: Date,

    dueDate: String,
    examDate: Date,
    durationMinutes: Number,
    syllabus: String,
    totalMarks: Number,


    category: String,
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    reportedAt: Date,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    lecture: {
      lectureNumber: Number,
      topics: [String],

      resources: [
        {
          title: String,
          url: String,
          type: {
            type: String,
            enum: ["video", "article", "pdf", "slide", "other"],
            default: "other",
          },
        },
      ],
    },

    isAnonymous: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);



const Communication = mongoose.model("Communication", CommunicationSchema);
export default Communication