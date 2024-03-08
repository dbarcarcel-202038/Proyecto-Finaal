import {Schema, model} from 'mongoose'

const billSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            priceForEach: {
                type: Number,
                required: true
            },            
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    amountForAll: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
},{
    versionKey: false
});

export default model('bill', billSchema )