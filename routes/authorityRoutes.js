import express, { Router } from 'express'
import { userAuth } from '../middleware/userAuth.js'
import { roleGuard } from '../middleware/roleGuard.js'
import {  addCourse, addDepartment,  addTeacher, deleteCourse, deleteDepartment,  getAllCourseList, getAllDepartmentList,  getAllUserList, getDashboardCounts,   removeUser,  resetAll } from '../controllers/authorityController.js'
const router = express.Router()

// get dashboard count
router.get("/dashboard", userAuth, roleGuard('authority'), getDashboardCounts)
// add department
router.post('/add-dept', userAuth, roleGuard('authority'), addDepartment )
// delete department
router.delete('/delete-dept', userAuth, roleGuard('authority'), deleteDepartment )
// add course
router.post('/add-course', userAuth, roleGuard('authority'), addCourse )
// delete course
router.delete('/delete-course', userAuth, roleGuard('authority'), deleteCourse )
// add teacher
router.post('/add-teacher', userAuth, roleGuard('authority'), addTeacher )
// delete user
router.delete('/delete-user', userAuth, roleGuard('authority'), removeUser )

// get department list
router.get('/department-list',  getAllDepartmentList)
// get users list
router.get('/users-list', userAuth, roleGuard('authority'), getAllUserList)
// get course list
router.get('/course-list', userAuth, roleGuard('authority','teacher'), getAllCourseList)
// reset all
router.post('/reset-all', userAuth, roleGuard('authority'), resetAll)

export default router