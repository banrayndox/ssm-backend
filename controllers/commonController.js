import User from "../models/User.js"
import Communication from "../models/Communication.js"
import Enrollment from "../models/Enrollment.js"
// get profile data
export const getProfileData = async (req,res) => {
const {userId} = req.body
console.log(userId)
if(!userId) return res.json({success: false, message:'User Id required'})
  try {
    const user = await User.findById(userId).select('-password').populate('departmentId', 'name').populate([
        {
          path: "enrolledCourses",
          populate: {
            path: "courseId",
            select: "name code"
          },
          select: "courseId section type"
        },
        {
          path: "createdCourses",
          populate: {
            path: "courseId",
            select: "name code"
          },
          select: "courseId section type"
        }
      ])
    if(!user) return res.json({success: false, message:'User not found'})
     return res.json({success: true, user}) 
  } catch (error) {
    return res.json({success: false, message: error.message})
  }

}
// edit profile data
export const editProfileData = async (req, res) => {
  const {  phone, roomNo, address } = req.body;

  try {
    const user = await User.findById(req.user.userId); // userAuth middleware set req.userId
    if(!user) return res.json({ success: false, message:'User not found' });

    if(phone) user.phone = phone
    if(roomNo) user.roomNo = roomNo
    if(address) user.address = address

    await user.save();
    return res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// delete profile
export const deleteProfileData = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // 1️⃣ Remove student from all enrollments
    await Enrollment.updateMany(
      { students: userId },
      { $pull: { students: userId } }
    );

    // 2️⃣ Handle CR role
    await Enrollment.updateMany(
      { crId: userId },
      { $unset: { crId: "" } } // or set null
    );

    // 3️⃣ Handle Teacher role
    const teacherEnrollments = await Enrollment.find({ teacherId: userId });

    if (teacherEnrollments.length > 0) {
      // Option A (recommended): block delete
      return res.json({
        success: false,
        message: "Teacher cannot delete profile while having active courses"
      });

      // Option B (dangerous): delete all courses
      // await Enrollment.deleteMany({ teacherId: userId });
    }

    // 4️⃣ Finally delete user
    await User.findByIdAndDelete(userId);
    res.clearCookie("token");

    return res.json({
      success: true,
      message: "Profile deleted and removed from all enrollments"
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// add task
export const addIssue = async (req, res) => {
  const {
    content,
    category,
    status,
    type,
    enrollmentId


  } = req.body;

  const userId = req.user.userId;


  try {

    const communication = await Communication.create({
      type,
       category,
      content,
      createdBy: userId,
      status,
      enrollmentId
    });

    await communication.populate([
      {
        path: "createdBy",
        select: "name role"
      }
    ]);

    return res.json({
      success: true,
      message: "Task added",
      communication
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// add task
export const addTask = async (req, res) => {
  const {
    title,
    content,
    priority,
    dueDate,
  } = req.body;

  const userId = req.user.userId;


  try {

    const communication = await Communication.create({
      type:'task',
      title,
      content,
      createdBy: userId,
      priority,
      dueDate,
      enrollmentId: null
    });

    await communication.populate([
      {
        path: "createdBy",
        select: "name role"
      }
    ]);

    return res.json({
      success: true,
      message: "Task added",
      communication
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
// get task
export const getTasks = async (req, res) => {
  try {
    // fetch all tasks
    const tasks = await Communication.find({ type: "task" ,  createdBy: req.user.userId})
      .populate({
        path: "createdBy",
        select: "name role"
      })
      .sort({ createdAt: -1 }); // latest first

    return res.json({
      success: true,
      tasks
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
//delete task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    const userId = req.user.userId;

    if (!taskId) {
      return res.json({ success: false, message: "taskId is required" });
    }

    // find the task and make sure it's owned by this user
    const task = await Communication.findOne({ _id: taskId, createdBy: userId, type: "task" });
    if (!task) {
      return res.json({ success: false, message: "Task not found or you cannot delete it" });
    }

    await task.deleteOne();

    return res.json({ success: true, message: "Task deleted successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// add communication
export const addCommunication = async (req, res) => {
  const {
    type,
    title,
    content,
    enrollmentId,
    time,
    date,
    duration,
    syllabus,
    priority,
    category,
    dueDate,
    total,
    status, 
    option1,
    option2,
    lecture
  } = req.body;

  const userId = req.user.userId;

  if (!type || !enrollmentId) {
    return res.json({ success: false, message: "Missing data" });
  }

  try {
    // 1️⃣ Check enrollment
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.json({ success: false, message: "Enrollment not found" });
    }

    // 2️⃣ Permission: Teacher or CR
    const isTeacher = enrollment.teacherId.toString() === userId;
    const isCR = enrollment.crId?.toString() === userId;

    if (!isTeacher && !isCR) {
      return res.status(403).json({
        success: false,
        message: "Only Teacher or CR can create communication"
      });
    }

    // 3️⃣ Create communication
    const communication = await Communication.create({
      type,
      title,
      content,
      enrollmentId,
      createdBy: userId,
      time,
      date,
      duration,
      syllabus,
      priority,
      category,
      dueDate,
      total,
      status,
      option1,
      option2,
      lecture,
       reportedAt: new Date()
    });

    // ✅ Correct populate
    await communication.populate([
      {
        path: "createdBy",
        select: "name role"
      },
      {
        path: "enrollmentId",
        populate: {
          path: "courseId",
          select: "title code"
        }
      }
    ]);

    return res.json({
      success: true,
      message: "Communication added",
      communication
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// get communication

export const getCommunication = async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user.userId;
    const role = req.user.role;

    const user = await User.findById(userId).select(
      "enrolledCourses createdCourses"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let enrollmentIds = [];

    if (role === "student" ) {
      enrollmentIds = user.enrolledCourses || [];
    }

    if (role === "teacher") {
      enrollmentIds = user.createdCourses || [];
    }

    if (!enrollmentIds.length) {
      return res.json({
        success: true,
        communications: [],
      });
    }

    const filter = { enrollmentId: { $in: enrollmentIds } };
    if (type) filter.type = type;

    const communications = await Communication.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name role")
      .populate({
        path: "enrollmentId",
        populate: {
          path: "courseId",
          select: "name code",
        },
      });

    return res.json({
      success: true,
      communications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// delete communication

export const deleteCommunication = async (req, res) => {
  const { communicationId } = req.body;
  const userId = req.user.userId;

  try {
    // 1️⃣ Find communication
    const communication = await Communication.findById(communicationId);
    if (!communication) {
      return res.json({ success: false, message: "Communication not found" });
    }

    // 2️⃣ Find enrollment
    const enrollment = await Enrollment.findById(communication.enrollmentId);
    if (!enrollment) {
      return res.json({ success: false, message: "Enrollment not found" });
    }

    // 3️⃣ Permission check
    const isTeacher = enrollment.teacherId.toString() === userId;
    const isCR = enrollment.crId?.toString() === userId;
    const isCreator = communication.createdBy.toString() === userId;

    if (!isTeacher && !isCR && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this communication"
      });
    }

    // 4️⃣ Delete
    await communication.deleteOne();

    return res.json({ success: true, message: "Communication deleted" });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// issue resolve - cr
export const resolveIssue = async (req, res) => {
  try {
    const { issueId } = req.body;
    const userId = req.user.userId;

    if (!issueId) {
      return res.json({ success: false, message: "issueId required" });
    }

    const issue = await Communication.findById(issueId);
    if (!issue) {
      return res.json({ success: false, message: "Issue not found" });
    }

    const enrollment = await Enrollment.findById(issue.enrollmentId);
    if (!enrollment) {
      return res.json({ success: false, message: "Enrollment not found" });
    }

    const isCR = enrollment.crId?.toString() === userId;
    const isTeacher = enrollment.teacherId.toString() === userId;

    if (!isCR && !isTeacher) {
      return res.status(403).json({
        success: false,
        message: "Only CR or Teacher can resolve issue"
      });
    }

    issue.status = "resolved";
    issue.resolvedAt = new Date();
    issue.resolvedBy = userId;

    await issue.save();

    return res.json({ success: true, message: "Issue resolved", issue });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// upvote
export const upvoteIssue = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.body;

    if (!id) {
      return res.json({ success: false, message: "issueId required" });
    }

    const issue = await Communication.findById(id);
    if (!issue) {
      return res.json({ success: false, message: "Issue not found" });
    }

    const enrollment = await Enrollment.findById(issue.enrollmentId);
    if (!enrollment) {
      return res.json({ success: false, message: "Enrollment not found" });
    }

    const isTeacher = enrollment.teacherId.toString() === userId;
    const isCR = enrollment.crId?.toString() === userId;
    const isStudent = enrollment.students.includes(userId);

    if (!isTeacher && !isCR && !isStudent) {
      return res.json({ success: false, message: "Not enrolled" });
    }

    const alreadyUpvoted = issue.upvotes.some(uid => uid.equals(userId));

    if (alreadyUpvoted) {
      issue.upvotes = issue.upvotes.filter(uid => !uid.equals(userId));
    } else {
      issue.upvotes.push(userId);
    }

    await issue.save();

    return res.json({
      success: true,
      upvotes: issue.upvotes.length
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// poll vote - user

export const votePoll = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { pollId, selectedOption } = req.body;

    if (!pollId || !selectedOption) {
      return res.json({ success: false, message: "All fields required" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "student") {
      return res.json({ success: false, message: "Only students can vote" });
    }
    const poll = await Communication.findById(pollId);
  
    if (!poll) {
      return res.json({ success: false, message: "Poll not found" });
    }

    poll.option1Votes = poll.option1Votes || [];
    poll.option2Votes = poll.option2Votes || [];
    // Remove old vote
poll.option1Votes = poll.option1Votes.filter(id => id.toString() !== userId);
poll.option2Votes = poll.option2Votes.filter(id => id.toString() !== userId);

    if (selectedOption === "option1") {
      poll.option1Votes.push(userId);
    } else if (selectedOption === "option2") {
      poll.option2Votes.push(userId);
    } else {
      return res.json({ success: false, message: "Invalid option" });
    }

    await poll.save();

    return res.json({ success: true, message: "Vote submitted", poll });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// get poll result
export const getPollResult = async (req, res) => {
  try {
    const { pollId } = req.body;
    const userId = req.user.userId;

    if (!pollId) {
      return res.json({ success: false, message: "pollId required" });
    }

    const poll = await Communication.findById(pollId);
    if (!poll) {
      return res.json({ success: false, message: "Poll not found" });
    }

    const enrollment = await Enrollment.findById(poll.enrollmentId);
    if (!enrollment) {
      return res.json({ success: false, message: "Enrollment not found" });
    }

    const isTeacher = enrollment.teacherId.toString() === userId;
    const isCR = enrollment.crId?.toString() === userId;
    const isStudent = enrollment.students.includes(userId);

    if (!isTeacher && !isCR && !isStudent) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    return res.json({ success: true, result: poll });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};





export const getEnrollmentDetails = async (req, res) => {
  try {
    const { enrollmentId } = req.body;

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message: "enrollmentId is required",
      });
    }

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("students", "name email studentId role _id")     
      .populate("teacherId", "name email")
      .populate("crId", "name email");
      
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    res.json({
      success: true,
      students: enrollment.students, 
      teacher: enrollment.teacherId,
      cr: enrollment.crId,
      passkey: enrollment.passKey
    });
  } catch (err) {

    res.status(500).json({ success: false, message: err.message });
  }
};

