import { Schema, model } from "mongoose"

const userSchema = Schema({
    name: {
        type: String,
        require: [true, "Name is required"]
    },
    surname: {
        type: String,
        require: [true, "Lastname is required"]
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, "Username is required"]
    },
    email:{
        type: String,
        require: [true, "email is required"]
    },
    password: {
        type: String,
        require: [true, "password is required"]
    },
    role: {
        type: String,
        uppercase: true,
        enum: ['CLIENT', 'ADMIN'],
        require: [true, "role is required"]
        
    }
}, {
    versionKey: false
})

export default model('user', userSchema)