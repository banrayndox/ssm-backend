import Department from '../models/Department.js'
import Course from '../models/Course.js'
import User from '../models/User.js'
import Section from '../models/Section.js'


// dashboard count 
export const dashboardCounts = async (req, res) => {
  try {
    const users = await User.countDocuments()
    const departments = await Department.countDocuments()
    const sections = await Section.countDocuments()
    const courses = await Course.countDocuments()

    res.status(200).json({
      success: true,
      data: {
        users,
        departments,
        sections,
        courses
      }
    })
  } catch (error) {
    console.error("Dashboard Count Error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard counts"
    })
  }
}
// dept list
export const getAllDepartmentList = async (req, res) => {
try {
const departments = await Department.find()
if(!departments) return res.json({success: false, message:'No Department found'})
return res.json({success: true, departments})
} catch (error) {
return res.json({success: false, message: error.message})    
}

}
// course list
export const getAllCourseList = async(req,res) => {
try {
const courses = await Course.find()
if(!courses) return res.json({success: false, message:'No Course found'})
return res.json({success: true, courses})
} catch (error) {
return res.json({success: false, message: error.message})    
}
}
// user list ( filter out in frontend - teacher / student / cr / all )
export const getAllUserList = async (req,res) => {
try {
const users = await User.find().select('-password').populate('sectionId', 'name semester')
if(!users) return res.json({success: false, message:'No user found'})
return res.json({success: true, users})
} catch (error) {
return res.json({success: false, message: error.message})    
}
}

// section list
// section list
export const getAllSectionList = async (req, res) => {
  try {
    const { departmentId, semester } = req.query

    const filter = {}
    if (departmentId) filter.departmentId = departmentId
    if (semester) filter.semester = Number(semester)

    const sections = await Section.find(filter)
      .populate('departmentId', 'name')

    if (sections.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'No section found' })
    }

    return res.status(200).json({ success: true, sections })
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message })
  }
}


// add teacher
export const addTeacher = async (req, res) => {
const { email, name, departmentId, teacherId, teacherInitial, roomNo, role } = req.body
if(!email || !name || !departmentId || !teacherInitial || !teacherId || !roomNo) return res.json({success: false, message:'All fields are required'})
    try {
        const teacher = await User.create({
            name,
            email,
            role,
            teacherId,
            teacherInitial,
            departmentId,
            password: '123456789',
            roomNo
        })
        res.json({success: true, message:'Teacher Added, password sent to his mail'})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

// assign cr
export const assignCR = async (req, res) => {
 const {userId, sectionId} = req.body
 if(!userId || !sectionId) return res.json({success: false, message:'All fields are required'})
    try {
        const user = await User.findById(userId)
        if(!user) return res.status(404).json({success: false, message: 'User not found'})
        const section = await Section.findById(sectionId)
        if(!section) return res.status(404).json({success: false, message:'Section not found'})    
        const existingCR = await User.findOne({
        sectionId,
        role: 'cr'
        })    
        if(existingCR) return res.status(400).json({success: false, message:'This section already has a CR'})
        user.role = 'cr'
        user.sectionId = sectionId
        await user.save()   
        res.json({success: true, message: 'CR assigned'})
    } catch (error) {
        return res.json({success: true, message:error.message})
    }
}
// remove cr 
export const removeCR = async (req, res) => {
 const { userId } = req.body
  if(!userId) return res.status(404).json({success: false, message: 'Id required'})
   try {
    await User.findByIdAndUpdate(userId,{
        role: 'student',
        sectionId: null
    })
    return res.json({success: true, message:'CR removed'})
   } catch (error) {
    return res.json({success: false, message: error.message})
   } 
}
// add section
export const addSection = async (req, res) => {
 const {name, semester, departmentId} = req.body
 if(!name || !semester || !departmentId)  return res.json({success: false, message: 'All fields are required'})
    try {
        const exists = await Section.findOne({
            name,
            semester,
           departmentId
        })
        if(exists) return res.json({success: false, message: 'Section already exists'})
        const section = await Section.create({
        name,
        semester,
        departmentId
        }) 
       return res.json({success: true, message: 'Section added successfully', section})   
    } catch (error) {
        return res.json({success: false, message: 'Section already exists'})
    }
}
// remove section
export const removeSection = async (req,res) => {
    const { sectionId } = req.body
    if(!sectionId) return res.json({success: false, message:'Id required'})
        try {
            await User.updateMany(
                {sectionId},
                {role: 'student', sectionId: null}
            )
            await Section.findByIdAndDelete(sectionId)
           return res.json({message: 'Section removed successfully'})

        } catch (error) {
            return res.json({success: false, message: error.message})
        }

}
// add dept
export const addDepartment = async (req, res) => {
  const {name, code } = req.body
  if(!name || !code ) return res.json({success: false, message: 'All fields are required'})
  try {
  const exists = await Department.findOne({code})
  if(exists) return res.json({success: false, message: 'Department already exists!'})
    const dept = await Department.create({name, code})
return res.json({success: true, message: 'Departmend Added successfully', dept})
  } catch (error) {
    return res.json({success: false, message: error.message})
 }
}
// remove dept
export const removeDepartment = async (req, res) => {
 const { departmentId } = req.body
 if(!departmentId) return res.json({success: false, message:'Id is required'})
try {
     const sections = await Section.find({department: departmentId})
     const sectionIds = sections.map(s=>s._id)
     await User.updateMany(
      {sectionId: {$in: sectionIds}},
      {role:'student', sectionId:null}
     )
 await Section.deleteMany({department: departmentId})
 await Course.deleteMany({deptId: departmentId})
 await Department.findByIdAndDelete(departmentId)
 return res.json({success: true, message:'Department Deleted'})
} catch (error) {
    return res.json({success: false, message: error.message})
}

}
// add course
export const addCourse = async (req, res) => {
 const {name, code, departmentId, semester} = req.body
 if(!name || !code || !departmentId || !semester) return res.json({success:false, message:'Fill all fields'})
    try {
        const exists = await Course.findOne({
            code,
          departmentId
        })
        if(exists) return res.json({success: false, message: 'Course already exists'})
        const course = await Course.create({
        name,
        code,
        departmentId,
        semester
        })    
        res.json({success: true, message:'Course added successfully', course})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}
// remove course 
export const removeCourse = async (req,res) =>{
const {courseId} = req.body
if(!courseId) return res.json({success: false, message:'Id required'})
try {
    await Course.findByIdAndDelete(courseId)
    return res.json({success: true, message:'Course removed successfully'})
} catch (error) {
    return res.json({success: false, message:error.message})
}
}
// delete user
export const deleteUser = async (req, res) => {
    const {userId} = req.body
    if(!userId) return res.json({success: false, message:'Id required'})
    try {
        await User.findByIdAndDelete(userId)
    } catch (error) {
        return res.json({success: false, message: error.message})
    }    

}
// assign teacher to course-section
export const assignTeacherToCourseAndSection = async (req,res) => {
  const {courseId, sectionId, userId}  = req.body
  if(!courseId || !sectionId) return res.json({success: false, message: 'fill all fields'})
    try {
     const isValidCourse = await Course.findById(courseId)
     if(!isValidCourse) return res.json({success: false, message:'Invalid Course'})
     const isValidSection = await Section.findById(sectionId)
    if(!isValidSection) return res.json({success: false, message:'Invalid Section'})
     const isValidTeacher = await User.findById(userId)   
    if(!isValidTeacher || isValidTeacher.role != 'teacher') return res.json({success:false, message:'Invalid Teacher'})

    const alreadyAssigned = isValidTeacher.assignedCourses?.some( a=> a.courseId.toString()==courseId && a.sectionId.toString()==sectionId)
    if(alreadyAssigned) return res.json({success: false, message:'Already assigned'})    
    isValidTeacher.assignedCourses.push({
    courseId,
    sectionId
     })
     await isValidTeacher.save()
     return res.json({success:true, message:'Teacher assigned successfully',
        assignedCourses: isValidTeacher.assignedCourses
     })
        
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}


// reset all assignments
export const resetAll = async (req, res) => {
    try {
        await Section.deleteMany({})
        await User.updateMany({role: {$in: ['student', 'cr']}},
            {$set: {
            role: 'student',
            sectionId: null,
            reqToJoinSectionId: null
        }})
        await User.updateMany({role: {$in: ['teacher']}},{$set:{
            assignedCoursesAndSections:[]
        }})
        return res.json({success: true, message:'Reset Successfully'})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}


// mail system
// responsive
// dark mode
// routine
// lecture
