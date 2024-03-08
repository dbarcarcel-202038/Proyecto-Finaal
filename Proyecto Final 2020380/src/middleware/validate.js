import jwt from 'jsonwebtoken'
import User from '../user/user.model.js'


export const validateJwt = async (req, res, next) => {
    try {
        let secretKey = process.env.SECRET_KEY
        let { token } = req.headers
        if (!token) return res.status(401).send({ message: 'You need to be logged in' })
        let { uid } = jwt.verify(token, secretKey)
        let user = await User.findOne({ _id: uid })
        if (!user) return res.status(404).send({ message: 'user not found' })
        req.user = user
        next()
    } catch (error) {
        console.error(error);
        return res.status(401).send({ message: 'Invalid token' })
    }
}

export const ifAdmin = async(req, res, next)=>{
    try {
        let {user} = req
        if(!user || user.role !== 'ADMIN') return res.status(403).send({message: 'You dont have the authorization'})
        next()
    } catch (error) {
        console.error(error);
        return res.status(403).send({message: 'Unauthorized role'})
    }
}

export const ifClient = async(req, res, next)=>{
    try {
        let {user} = req
        if(!user || user.role !== 'CLIENT') return res.status(403).send({message: 'You dont have the authorization'})
        next()
    } catch (error) {
        console.error(error);
        return res.status(403).send({message: 'Unauthorized role'})
    }
}