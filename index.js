import express from 'express'
import { configDotenv } from 'dotenv'
import connectDB from './config/db.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
// routes
import userRoutes from './routes/userRoutes.js'
import authorityRoutes from './routes/authorityRoutes.js'
import authRoutes from './routes/authRoutes.js'

configDotenv()
connectDB()

const app = express()
const port = process.env.PORT || 3000
// middlewares
app.use(
  cors({
    origin: ["http://localhost:5173","https://diussm.vercel.app"], 
    credentials: true,            
  })
);
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// api endpoint for each route
app.use('/api/auth', authRoutes)
app.use('/api/authority', authorityRoutes)
app.use('/api/user', userRoutes)


app.listen(port, ()=>{
    console.log(`Server running on ${port}`)
})