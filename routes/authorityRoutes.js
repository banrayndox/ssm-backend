import express, { Router } from 'express'
import { userAuth } from '../middleware/userAuth.js'
import { roleGuard } from '../middleware/roleGuard.js'
import { addCourse, addDepartment, addSection, addTeacher, assignCR, assignTeacherToCourseAndSection, dashboardCounts, deleteUser, getAllCourseList, getAllDepartmentList, getAllSectionList, getAllUserList, removeCourse, removeCR, removeDepartment, removeSection, resetAll } from '../controllers/authorityController.js'
const router = express.Router()

// get dashboard count
router.get("/dashboard", userAuth, roleGuard('authority'), dashboardCounts)

// add department
router.post('/add-dept', userAuth, roleGuard('authority'), addDepartment )
// delete department
router.delete('/delete-dept', userAuth, roleGuard('authority'), removeDepartment )
// add course
router.post('/add-course', userAuth, roleGuard('authority'), addCourse )
// delete course
router.delete('/delete-course', userAuth, roleGuard('authority'), removeCourse )
// add section 
router.post('/add-section', userAuth, roleGuard('authority'), addSection )
// delete section
router.delete('/delete-section', userAuth, roleGuard('authority'), removeSection )
// remove user from database
router.delete('/delete-user', userAuth, roleGuard('authority'), deleteUser )
// assign cr to section
router.post('/assign-cr', userAuth, roleGuard('authority'), assignCR)
// remove cr from section
router.delete('/remove-cr', userAuth, roleGuard('authority'), removeCR )
// add teacher
router.post('/add-teacher', userAuth, roleGuard('authority'), addTeacher)
// assign teacher to course and section
router.post('/assign-teacher-course-section', userAuth, roleGuard('authority'), assignTeacherToCourseAndSection)
// get department list
router.get('/department-list',  getAllDepartmentList)
// get users list
router.get('/users-list', userAuth, roleGuard('authority'), getAllUserList)
// get course list
router.get('/course-list', userAuth, roleGuard('authority','cr'), getAllCourseList)
// get section list
router.get('/section-list', userAuth, roleGuard('authority','cr','student'), getAllSectionList)
// reset all
router.post('/reset-all', userAuth, roleGuard('authority'), resetAll)

export default router