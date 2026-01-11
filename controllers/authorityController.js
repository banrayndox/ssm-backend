import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import Department from "../models/Department.js";
import Course from "../models/Course.js";

export const addDepartment = async (req, res) => {
  try {
    const { name,code
     } = req.body;

    if (!name  || !code ) {
      return res.json({ success: false, message: "Department name required" });
    }

    const department = await Department.create({ name, code });

    res.json({ success: true, department });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



export const deleteDepartment = async (req, res) => {
  try {
    const { deptId } = req.body;

    // find courses under department
    const courses = await Course.find({ department: deptId });
    const courseIds = courses.map(c => c._id);

    // delete enrollments
    await Enrollment.deleteMany({ courseId: { $in: courseIds } });

    // delete courses
    await Course.deleteMany({ department: deptId });

    // delete department
    await Department.findByIdAndDelete(deptId);

    res.json({ success: true, message: "Department deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const addCourse = async (req, res) => {
  try {
    const { name, code, departmentId } = req.body;

    if (!name || !code || !departmentId) {
      return res.json({ success: false, message: "All fields required" });
    }

    const course = await Course.create({
      name,
      code,
     departmentId
    });

    res.json({ success: true, course });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    // delete enrollments under this course
    await Enrollment.deleteMany({ courseId });

    // delete course
    await Course.findByIdAndDelete(courseId);

    res.json({ success: true, message: "Course deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const addTeacher = async (req, res) => {
  try {
    const {
      name,
      email,
      departmentId,
      roomNo,
      teacherId,
      teacherInitial
    } = req.body;

    if (!name || !email) {
      return res.json({ success: false, message: "Name and Email required" });
    }

    // check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "User with this email already exists" });
    }

    user = await User.create({
      name,
      email,
      role: "teacher",
      departmentId,
      roomNo: roomNo || null,
      teacherId: teacherId || null,
      teacherInitial: teacherInitial || null,
      password: '123456'
    });

    res.json({ success: true, message: "Teacher added", teacher: user });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const removeUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "userId required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
     await User.findByIdAndDelete(userId)
    res.json({ success: true, message: "User removed" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const getDashboardCounts = async (req, res) => {
  try {
   
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const totalEnrollments = await Enrollment.countDocuments();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalEnrollments
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getAllDepartmentList = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    res.json({
      success: true, departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch department list",
    });
  }
};


export const getAllUserList = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true, users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users list",
    });
  }
};


export const getAllCourseList = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("departmentId", "name code")
      .sort({ createdAt: -1 });

    res.json({
      success: true, courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch course list",
    });
  }
};

export const resetAll = async (req, res) => {
  try {
    await Promise.all([
      Department.deleteMany({}),
      User.deleteMany({ role: { $ne: "authority" } }), // keep authority
      Course.deleteMany({}),
    ]);

    res.json({
      success: true,
      message: "System reset completed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "System reset failed",
    });
  }
};

// mail system
// responsive
// dark mode
// routine
// lecture
