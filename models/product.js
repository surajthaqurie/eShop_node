const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    richDescription: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    brand: {
        type: String
    },
    price: {
        type: Number,
        default: 0
    },
    categoryID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // reference to the schema
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    dataCreated: {
        type: Date,
        default: Date.now
    }
});


// Making virtual id Filed of _id in mongodb
productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
});



exports.Product = mongoose.model('Product', productSchema);
