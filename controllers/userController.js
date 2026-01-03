import Communication from "../models/Communication.js"
import User from "../models/User.js"
import Lecture from "../models/Lecture.js";
import Section from "../models/Section.js";


// get profile data
export const getProfileData = async (req,res) => {
const {userId} = req.body
console.log(userId)
if(!userId) return res.json({success: false, message:'User Id required'})
  try {
    const user = await User.findById(userId).select('-password').populate('departmentId', 'name').populate('sectionId', 'name').populate('reqToJoinSectionId', 'name')
    if(!user) return res.json({success: false, message:'User not found'})
     return res.json({success: true, user}) 
  } catch (error) {
    return res.json({success: false, message: error.message})
  }

}
// edit profile data
export const editProfileData = async (req, res) => {
  const {  name, address } = req.body;

  try {
    const user = await User.findById(req.user.userId); // userAuth middleware set req.userId
    if(!user) return res.json({ success: false, message:'User not found' });

    // update only fields provided
    if(name) user.name = name
    if(address) user.address = address
    // if(roomNo) user.roomNo = roomNo

    await user.save();
    return res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// delete profile
export const deleteProfileData = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if(!user) return res.json({ success: false, message:'User not found' });
    await User.findByIdAndDelete(req.user.userId);
    res.clearCookie('token');

    return res.json({ success: true, message: 'Profile deleted successfully' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// exit section
export const exitSection = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if(!user) return res.json({ success: false, message:'User not found' });
    user.sectionId = null; 
    await user.save();

    return res.json({ success: true, message:'Successfully exited section' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};



// assigned list
export const assignedStudentList = async (req, res) => {
    const userId = req.user.userId
    if(!userId) return res.json({ success: false, message: 'userId required' })

    try {
        const user = await User.findById(userId)
        if (!user || user.role !== 'cr') 
            return res.json({ success: false, message: 'CR not found' })

        const students = await User.find({ sectionId: user.sectionId })
        res.json({ success: true, students })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

 //  unassigned student list
 export const unAssignedStudentList = async (req, res) => {
    const userId = req.user.userId
    try {
        const user = await User.findById(userId)
        if(!user || user.role!='cr') return res.json({success: false, message:'CR not found'})
        const students = await User.find({
        reqToJoinSectionId: user.sectionId,
        role: 'student'
         })    
         return res.json({success:true, students})
    } catch (error) {
        return res.json({success:false, message:error.message})
    }
 }


// accept student
export const acceptStudent = async(req, res) => {
    const {studentId} = req.body
    const crId = req.user.userId
    if(!studentId || !crId) return res.json({success: false, message:'Missing details'})
    try {
        const cr = await User.findById(crId)
        if(!cr || cr.role!='cr') return res.json({success: false, message:'CR not found'})
        const student = await User.findById(studentId)
   if (student.reqToJoinSectionId && !student.reqToJoinSectionId.equals(cr.sectionId)) {
    return res.json({ success: false, message: 'Student requested a different section' })
}

        student.sectionId = cr.sectionId
        student.reqToJoinSectionId = null
        await student.save()    
        res.json({success: true, message:'Student assigned to section'})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

// remove student
export const removeStudent = async(req, res) => {
    const {studentId} = req.body
    const crId = req.user.userId
    if(!studentId || !crId) return res.json({success: false, message:'Missing details'})
    try {
        const cr = await User.findById(crId)
        if(!cr || cr.role!='cr') return res.json({success: false, message:'CR not found'})
        const student = await User.findById(studentId)
if (!student || !student.sectionId?.equals(cr.sectionId)) {
  return res.json({ success: false, message: 'Invalid Id' })
}
        student.sectionId = null
        await student.save()    
        res.json({success: true, message:'Student rejected to join section'})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}


// reject student
export const rejectStudent = async(req, res) => {
    const {studentId} = req.body
    const crId = req.user.userId
    if(!studentId || !crId) return res.json({success: false, message:'Missing details'})
    try {
        const cr = await User.findById(crId)
        if(!cr || cr.role!='cr') return res.json({success: false, message:'CR not found'})
        const student = await User.findById(studentId)
    if (
    !student ||
    !student.reqToJoinSectionId ||
    !student.reqToJoinSectionId.equals(cr.sectionId)
     ) {
     return res.json({ success: false, message: 'Invalid Id' })
    }

        student.reqToJoinSectionId = null
        await student.save()    
        res.json({success: true, message:'Student rejected to join section'})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

// add communication
export const addCommunication = async(req,res) =>{
    const {type, title, content,time,syllabus,date, duration, status, option1, option2, priority, category, dueDate, courseId, total} = req.body
  
    const userId = req.user.userId
    if(!userId || !type  ) return res.json({success: false, message:'data missing'})
    try {
     const cr = await User.findById(userId)
     if(!cr || cr.role!='cr') return res.json({success: false, message:'CR not found'})

    let communication = await Communication.create({
    type,
    sectionId: cr.sectionId,
    userId: userId,
    })
  
    if(title) communication.title = title
    if(content) communication.content = content
    if(option1 && option2) {
      communication.option1 = option1
      communication.option2 = option2
    }
    if(dueDate) communication.dueDate = dueDate
    if(time) communication.time = time
    if(date) communication.date = date
    if(total) communication.total = total
    if(duration) communication.duration = duration
    if(syllabus) communication.syllabus = syllabus
    if(category) communication.category = category
    if(priority) communication.priority = priority
    if(courseId) communication.courseId = courseId
    if(status) communication.status = status

   await communication.save()
   communication = await communication.populate('courseId','name');
           console.log(communication)

        return res.json({success: true, message: 'Added' ,communication})


    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}
// get communication
export const getCommunication = async (req, res) => {
  try {
    const { type } = req.body
    const userId = req.user.userId
    const user  = await User.findById(userId)
    const sectionId = user.sectionId
    if (!user.sectionId) {
  return res.json({ success: false, message: "You are not assigned to any section yet.", data: [] });
}
    let filter = {};
    if (type) filter.type = type;

    if (sectionId) filter.sectionId = sectionId;

    const communications = await Communication.find(filter)
      .sort({ createdAt: -1 }).populate('userId','name').populate('courseId','name');


    return res.json({
      success: true, communications
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
  try {
    const { communicationId } = req.body;

    if (!communicationId) {
      return res.status(400).json({
        success: false,
        message: "Communication ID is required",
      });
    }

    const communication = await Communication.findById(communicationId);

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: "Communication not found",
      });
    }

    await communication.deleteOne(); 

    return res.json({
      success: true,
      message: "Communication deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// add issue - user
export const addIssue = async(req,res) =>{
  console.log('hii')
    const {category, content} = req.body
    console.log(req.body)
    const userId = req.user?.userId
    console.log(userId)
    if(!userId || !category || !content) return res.json({success: false, message:'data missing'})
    try {
     const user = await User.findById(userId)
     if(!user || user.role!='student') return res.json({success: false, message:'User found'})
      await Communication.create({
       category,
       content,
       type: 'issue',
       sectionId: user.sectionId,
       userId
       })   
        return res.json({success: true, message: 'Added' })
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

// issue resolve - cr
export const resolveIssue = async (req, res) => {
  const { issueId } = req.body;
  const crId = req.user.userId

  const cr = await User.findById(crId);
  if (!cr || cr.role !== "cr") return res.status(403).json({ message: "Not a CR" });

  const issue = await Communication.findById(issueId);
  if (!issue || String(issue.sectionId) !== String(cr.sectionId)) {
    return res.status(400).json({ message: "Issue not found in your section" });
  }

  issue.status = "resolved";
  issue.resolvedAt = new Date();
  issue.resolvedBy = cr._id;
  await issue.save();

  res.json({ success: true, message: "Issue resolved", issue });
};
// upvote
export const upvoteIssue = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.body; // issue ID

    if (!userId || !id)
      return res.json({ success: false, message: "Missing data" });

    const issue = await Communication.findById(id);
    if (!issue) return res.json({ success: false, message: "Issue not found" });

    // If user already upvoted, remove the vote (toggle)
    if (issue.upvotes.includes(userId)) {
      issue.upvotes = issue.upvotes.filter(uid => uid.toString() !== userId);
    } else {
      issue.upvotes.push(userId);
    }

    await issue.save();

    return res.json({ success: true, upvotes: issue.upvotes.length });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
// poll vote - user
export const votePoll = async (req, res) => {
  const userId = req.user.userId
    const { pollId, selectedOption} = req.body
    if(!userId || !pollId || !selectedOption) return res.json({success: false, message: 'All fields need'})
    try {
    const user = await User.findById(userId)
    if(!user || user.role!='student') return res.json({success: false, message:'User not found'})
    const poll = await Communication.findById(pollId)    
    if(!poll) return res.json({success: false, message: 'Poll not found'})
    poll.option1Votes = poll.option1Votes.filter(v=> !v.equals(userId))
    poll.option2Votes = poll.option2Votes.filter(v=> !v.equals(userId))      
    if(selectedOption=='option1'){
    poll.option1Votes.push(userId)
    }else if(selectedOption=='option2'){
    poll.option2Votes.push(userId)
    }else {
    return res.json({success: false, message:'Invalid option selected'})
    }
    await poll.save()
    res.json({success:true,poll, message:'Vote added successfully'})
            
    } catch (error) {
            return res.json({success: true, message:error.message})
    }
}
export const getPollResult = async (req, res) => {
  try {
    const { pollId } = req.body   // get pollId from request body

    if (!pollId) {
      return res.status(400).json({ success: false, message: 'pollId is required' })
    }

    const result = await Communication.findById(pollId)

    if (!result) {
      return res.status(404).json({ success: false, message: 'Poll not found' })
    }

    console.log('Result:', result)

    return res.json({ success: true, result })
  } catch (error) {
    console.error('Backend error:', error)
    res.status(500).json({ success: false, message: 'Backend error' })
  }
}


// get assigned <course, section> for teacher
export const assignedCourse = async (req, res) => {
    const teacherId = req.user.useId
    if(!teacherId) return res.json({success: false, message: 'Invalid teacher id'})
    try {
     const user = await User.findById(teacherId).populate({
        path: 'assignedCourses.courseId',
        select: 'name code'
      })
      .populate({
        path: 'assignedCourses.sectionId',
        select: 'name semester'
      })
     if(!user || user.role!='teacher') return res.json({success: false, message:'Teacher not found'})

        return res.json({success: true,  assignedCourses: user.assignedCourses}) 
    } catch (error) {
        return res.json({success: true, message:error.message})
    }
}



//  Add Lecture
export const addLecture = async (req, res) => {
  try {
    const { courseId, sectionId, lectureNumber, topics } = req.body;

    const lecture = new Lecture({ courseId, sectionId, lectureNumber, topics });
    await lecture.save();

    return res.json({ success: true, lecture });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  Get Lectures per Course & Section


// Get Lectures by Section only
export const getLecturesBySection = async (req, res) => {
  try {
    const { sectionId } = req.body;

    if (!sectionId) {
      return res.status(400).json({ success: false, message: 'Section ID is required' });
    }

    // Fetch all lectures for the section
    const lectures = await Lecture.find({ sectionId }).sort({ lectureNumber: 1 });

    return res.json({ success: true, lectures });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


//  Update Lecture
export const updateLecture = async (req, res) => {
  try {
    const { lectureId } = req.body;
    const { topics, lectureNumber } = req.body;

    const lecture = await Lecture.findByIdAndUpdate(
      lectureId,
      { $set: { topics, lectureNumber } },
      { new: true }
    );

    if (!lecture) {
      return res.status(404).json({ success: false, message: "Lecture not found" });
    }

    return res.json({ success: true, lecture });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  Delete Lecture
export const deleteLecture = async (req, res) => {
  try {
    const { lectureId } = req.body;

    const lecture = await Lecture.findByIdAndDelete(lectureId);

    if (!lecture) {
      return res.status(404).json({ success: false, message: "Lecture not found" });
    }

    return res.json({ success: true, message: "Lecture deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



// POST /api/users/request-section
export const requestSection = async (req, res) => {
  const userId = req.user.userId; 
  const { sectionId } = req.body;
  if (!sectionId) {
    return res.status(400).json({ success: false, message: "Section ID is required." });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (user.sectionId) {
      return res.status(400).json({
        success: false,
        message: "You are already assigned to a section.",
      });
    }
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ success: false, message: "Section not found." });
    }
    if (
      section.departmentId.toString() !== user.departmentId.toString() ||
      section.semester !== user.semester
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot request this section. It does not match your department or semester.",
      });
    }

    if (user.reqToJoinSectionId?.toString() === sectionId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You have already requested this section.",
      });
    }

    user.reqToJoinSectionId = sectionId;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Request to join section sent successfully!",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};
// cancel join section request
export const cancelJoinRequest = async (req, res) => {
  try {
    const userId = req.user.userId

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    if (!user.reqToJoinSectionId) {
      return res.status(400).json({
        success: false,
        message: "No pending join request to cancel"
      })
    }

    user.reqToJoinSectionId = null
    await user.save()

    return res.status(200).json({
      success: true,
      message: "Join request cancelled successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


