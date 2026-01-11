import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";

export const joinCourse = async (req, res) => {
  try {
    const {  passKey } = req.body;
  const studentId = req.user.userId
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({ success: false, message: "Invalid student" });
    }

    const enrollment = await Enrollment.findOne({ passKey });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Invalid pass key" });
    }

    // Check if already enrolled
    if (enrollment.students.includes(studentId)) {
      return res.status(400).json({ success: false, message: "Already enrolled" });
    }

    enrollment.students.push(studentId);
    await enrollment.save();

    // Add course to student's profile
    student.enrolledCourses.push(enrollment._id);
    await student.save();

    res.json({ success: true, message: "Enrolled successfully", enrollment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




