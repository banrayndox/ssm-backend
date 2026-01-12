import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";

export const createCourse = async (req, res) => {
  try {
    const teacherId = req.user.userId
    const { courseId,type, section, passKey} = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({ success: false, message: "Invalid teacher" });
    }
     const existing = await Enrollment.findOne({ passKey });
    if (existing) {
      console.log('exits');
      
      return res
        .status(400)
        .json({ success: false, message: "PassKey already in use for existing course. Should use unique PassKey." });

    }

    const enrollment = await Enrollment.create({
      courseId,
     teacherId,
      section,
      type,
      passKey,
      students: [],
    });

    // Add course to teacher profile
    teacher.createdCourses.push(enrollment._id);
    await teacher.save();

    res.json({ success: true, message: "Course created", enrollment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const updatePassKey = async (req, res) => {
  try {
    const { enrollmentId, newPassKey } = req.body;
    const userId = req.user.userId;

    if (!enrollmentId || !newPassKey) {
      return res.json({ success: false, message: "All fields required" });
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.json({ success: false, message: "Course not found" });
    }
 
    const isTeacher = String(enrollment.teacherId) === String(userId)

    if (!isTeacher && !isCR) {
      return res.status(403).json({
        success: false,
        message: "Only teacher can update passkey"
      });
    }

    if(enrollment.passKey == newPassKey) {
         return res
        .status(400)
        .json({ success: false, message: "Old passKey is same. PassKey should unique." });

    }

      const existing = await Enrollment.findOne({ newPassKey });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "PassKey already in use for existing course. Should use unique PassKey." });

    }

    enrollment.passKey = newPassKey;
    await enrollment.save();

    res.json({ success: true, message: "Passkey updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



export const removeStudentFromCourse = async (req, res) => {
  try {
    const { enrollmentId, studentId } = req.body;
    const userId = req.user.userId;

    if (!enrollmentId || !studentId) {
      return res.json({ success: false, message: "Missing data" });
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.json({ success: false, message: "Course not found" });
    }

    const isTeacher = enrollment.teacherId.toString() === userId;

    if (!isTeacher && !isCR) {
      return res.status(403).json({
        success: false,
        message: "Only teacher can remove students"
      });
    }

    enrollment.students = enrollment.students.filter(
      id => id.toString() !== studentId
    );
    await User.findByIdAndUpdate(studentId, {
      $pull: { enrolledCourses: enrollmentId },
    });
    await enrollment.save();

    res.json({ success: true, message: "Student removed from course" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



export const assignCR = async (req, res) => {
  try {
    const { enrollmentId, studentId } = req.body;
    const teacherId = req.user.userId;
    if (!enrollmentId || !studentId) {
      return res.json({ success: false, message: "Missing data" });
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.json({ success: false, message: "Enrollment not found" });
    }

    // Only teacher can assign CR
    if (enrollment.teacherId.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: "Only teacher can assign CR",
      });
    }

    // Check student enrolled or not
    const isEnrolled = enrollment.students.some(
      (id) => id.toString() === studentId
    );

    if (!isEnrolled) {
      return res.json({
        success: false,
        message: "Student is not enrolled in this course",
      });
    }

    // Assign CR
    enrollment.crId = studentId;
    await enrollment.save();

    res.json({
      success: true,
      message: "CR assigned successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// remove cr
export const removeCR = async (req, res) => {
  try {
    const { enrollmentId } = req.body;
    const teacherId = req.user.userId;

    if (!enrollmentId) {
      return res.json({ success: false, message: "Enrollment ID required" });
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.json({ success: false, message: "Enrollment not found" });
    }

    // Only teacher
    if (enrollment.teacherId.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: "Only teacher can remove CR",
      });
    }

    enrollment.crId = null;
    await enrollment.save();

    res.json({
      success: true,
      message: "CR removed successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
