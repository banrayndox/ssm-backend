import express from 'express'
import { unAssignedStudentList, assignedStudentList, acceptStudent, rejectStudent, removeStudent, addCommunication, addIssue, getCommunication, deleteCommunication, resolveIssue, votePoll, assignedCourse, getProfileData, editProfileData, deleteProfileData, exitSection, addLecture, deleteLecture, updateLecture, getLecturesBySection, upvoteIssue, getPollResult, requestSection, cancelJoinRequest } from '../controllers/userController.js'
import { roleGuard } from '../middleware/roleGuard.js'
import { userAuth} from '../middleware/userAuth.js'

const router = express.Router()
// cr
// add lecture
router.post('/add-lecture', userAuth, roleGuard('cr', 'teacher'), addLecture)
// delete lecture
router.delete('/delete-lecture', userAuth, roleGuard('cr', 'teacher'), deleteLecture)
// update lecture
router.patch('/update-lecture', roleGuard('cr', 'teacher'), updateLecture)
// get lectures
router.get('/get-lecture', userAuth, roleGuard('cr', 'teacher','student'), getLecturesBySection)
// get unassigned student
router.get('/get-unassigned', userAuth , roleGuard('cr') , unAssignedStudentList)
// get assigned student
router.get('/get-assigned', userAuth , roleGuard('cr') , assignedStudentList)
// accept user to section
router.post('/accept-student', userAuth , roleGuard('cr') , acceptStudent)
// reject user from waiting list
router.post('/reject-student', userAuth , roleGuard('cr') , rejectStudent)
// remove user from section
router.post('/remove-student', userAuth , roleGuard('cr') , removeStudent)
// add communication
router.post('/add-communication', userAuth, roleGuard('cr','teacher'), addCommunication)
// get communication
router.post('/get-communication', userAuth, roleGuard('cr','teacher','student'), getCommunication)
// delete communication
router.delete('/delete-communication', userAuth, roleGuard('cr'), deleteCommunication)
// resolve issue
router.post('/resolve', userAuth, roleGuard('cr'), resolveIssue)
// upvote issue
router.post('/upvote',userAuth,roleGuard('student'), upvoteIssue)
// Student
// request section
router.post('/reqtojoin', userAuth, requestSection)
// cancel request to join section
router.post('/canceljoinsection', userAuth, cancelJoinRequest)
// get profile
router.post('/profile',userAuth, roleGuard('cr','student','authority','teacher'), getProfileData)
// edit profile
router.post('/edit-profile', userAuth, roleGuard('cr', 'student', 'authority', 'teacher'), editProfileData)
// delete profile
router.delete('/delete-profile', userAuth, roleGuard('cr','teacher', 'student'), deleteProfileData)
// exit section
router.post('/exit-section', userAuth, roleGuard('student, cr'), exitSection)
// add issue
router.post('/add-issue',userAuth, roleGuard('student'), addIssue)
// vote poll
router.post('/vote', userAuth, roleGuard('student'), votePoll)
// get result
router.post('/vote-result', userAuth, roleGuard('student','cr'), getPollResult)
// teacher
// get assigned courses
router.get('/assigned-courses', userAuth, roleGuard('teacher'), assignedCourse)

export default router