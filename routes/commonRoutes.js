import express from 'express'
import { userAuth } from '../middleware/userAuth.js'
import { roleGuard } from '../middleware/roleGuard.js'
import { addCommunication, addTask, deleteCommunication, deleteProfileData, deleteTask, editProfileData, getCommunication, getEnrollmentDetails, getPollResult, getProfileData, getTasks, resolveIssue, upvoteIssue, votePoll } from '../controllers/commonController.js'

const router = express.Router()

// get profile
router.post('/profile',userAuth, roleGuard('student','authority','teacher'), getProfileData)
// edit profile
router.post('/edit-profile', userAuth, roleGuard('student', 'authority', 'teacher','dept-head'), editProfileData)
// delete profile
router.delete('/delete-profile', userAuth, roleGuard('teacher', 'student','dept-head'), deleteProfileData)

// add task
router.post('/add-task', userAuth, roleGuard('student','teacher'), addTask)
// get task
router.get('/get-task', userAuth, getTasks)
// delete task
router.delete('/delete-task', userAuth, deleteTask)
// add communication
router.post('/add-communication', userAuth, roleGuard('student','teacher'), addCommunication)
// get communication
router.post('/get-communication', userAuth, roleGuard('teacher','student'), getCommunication)
// delete communication
router.delete('/delete-communication', userAuth, roleGuard('teacher','student'), deleteCommunication)


// vote poll
router.post('/vote', userAuth, roleGuard('student'), votePoll)
// get result
router.post('/vote-result', userAuth, roleGuard('student','teacher'), getPollResult)
// resolve issue
router.post('/resolve', userAuth, roleGuard('student','teacher'), resolveIssue)
// upvote issue
router.post('/upvote',userAuth,roleGuard('student'), upvoteIssue)

// get enrolled students
router.post('/get-enrolled', userAuth, roleGuard('student', 'teacher'),getEnrollmentDetails)
export default router