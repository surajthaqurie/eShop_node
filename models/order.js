const mongoose = require('mongoose');


const orderSchema = mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem', // reference to the schema(table)
        required: true
    }],
    shippingAddress1: {
        type: String,
        required: true
    },
    shippingAddress2: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'Pending'
    },
    totalPrice: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
});

// Making virtual id Filed of _id in mongodb
orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true,
});


exports.Order = mongoose.model('Order', orderSchema);

/*
Order Example: The JSON data send to the backend

{
"orderItems": [
    {
        "quantity": "3",
        "product": "productID"
    },
    {
        "quantity": "3",
        "product": "productID"
    }
],
"shippingAddress1": "Flowers Street,45",
"shippingAddress2": "1-B",
"city": "Prague",
"zip": "00000",
"country": "Czech Republic",
"phone": "+480702241333",
"user": "userID"
}
**/