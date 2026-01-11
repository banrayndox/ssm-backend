import jwt from 'jsonwebtoken'

export const userAuth = async (req, res, next) => {
    const token = req.cookies.token
    if(!token) return res.json({success: false, message:'Not authorized, Login again'})
        try {

            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
            req.user = decoded
            next()
        } catch (error) {
            console.log('failed')
            return res.json({success:false, message: error.message})
        }
}