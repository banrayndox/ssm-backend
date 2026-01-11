import express from 'express'
import { userAuth } from '../middleware/userAuth.js'
import { roleGuard } from '../middleware/roleGuard.js'
import { assignCR, createCourse, removeCR, removeStudentFromCourse, updatePassKey } from '../controllers/teacherController.js'

const router  = express.Router()

// create a course
router.post('/create-course',  userAuth, roleGuard('teacher'), createCourse)
// update pass key
router.post('/update-passkey', userAuth, roleGuard('teacher'), updatePassKey)
// remove student from course
router.post('/delete-from-course', userAuth, roleGuard('teacher'), removeStudentFromCourse)
// assign cr
router.post('/assign-cr', userAuth, roleGuard('teacher'), assignCR)
// remove
router.post('/remove-cr', userAuth, roleGuard('teacher'), removeCR)
export default router