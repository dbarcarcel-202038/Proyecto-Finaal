import {Schema, model} from "mongoose"

const categorySchema = Schema({
    name:{
        type: String,
        require: [true, 'Category is required.']
    },
    description:{
        type: String,
        require: [true, "Description is require"]
    }
},{
    versionKey: false
})

export default model('category', categorySchema)