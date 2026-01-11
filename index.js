import express from 'express'
import { configDotenv } from 'dotenv'
import connectDB from './config/db.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'

// routes
import authorityRoutes from './routes/authorityRoutes.js'
import authRoutes from './routes/authRoutes.js'
import teacherRoutes from './routes/teacherRoutes.js'
import studentRoutes from './routes/studentRoute.js'
import commonRoutes from './routes/commonRoutes.js'

// configuration
configDotenv()
connectDB()

const app = express()
const port = process.env.PORT || 3000

// middlewares
app.use(
  cors({
    origin: ["http://localhost:5173","https://diussm.vercel.app"], 
    credentials: true,   
    methods: ["GET", "POST", "PUT", "DELETE"]         
  })
);
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// api endpoint for each route
app.use('/api/auth', authRoutes)
app.use('/api/authority', authorityRoutes)
app.use('/api/teacher', teacherRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/common', commonRoutes)


app.listen(port, ()=>{
    console.log(`Server running on ${port}`)
})