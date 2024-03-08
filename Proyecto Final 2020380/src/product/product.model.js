import {Schema, model} from "mongoose"

const productSchema = Schema({
    name: {
        type: String,
        require: true
    },
    price:{
        type: Number,
        require: true,
        default: 0
    },
    stock:{
        type: Number,
        require: true,
        default: 0
    },
    category:{
        type: Schema.Types.ObjectId,
        ref: 'category',
        require: true
    }
}, {
    versionKey: false
})

export default model('product', productSchema)