import {Schema, model} from 'mongoose'

const shoppingSchema = Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        require: [true, "User is required"]
    },
    products:[{
        product:{
            type: Schema.Types.ObjectId,
            ref: 'product',
            require: [true, "Product is required"]
        },
        quantity:{
            type: Number,
            default: 1,
            require: [true, "Quantity is required"]
        }
    }],
    total:{
        type: Number,
        require: true
    }
    
},{
    versionKey: false
})

export default model('shopping', shoppingSchema)