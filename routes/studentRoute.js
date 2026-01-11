import express from 'express'

import { userAuth} from '../middleware/userAuth.js'

import { roleGuard } from '../middleware/roleGuard.js'
import {  joinCourse } from '../controllers/studentController.js'
import { addIssue,  } from '../controllers/commonController.js'

const router = express.Router()

// enroll a course
router.post('/join-course',  userAuth, roleGuard('student'), joinCourse)

router.post('/add-issue', userAuth, roleGuard('student'), addIssue)
export default router