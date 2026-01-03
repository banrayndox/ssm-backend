import express from "express";
import { isAuthenticated, Login, Logout, Register } from "../controllers/authController.js";
const router = express.Router()

// register
router.post('/register', Register)
// login 
router.post('/login', Login)
// logout
router.get('/logout', Logout)
// get authenticated
router.get('/get-authenticated', isAuthenticated)
export default router