const { Product } = require('../models/product');
const { Category } = require('../models/category');

const express = require('express');
const productsRouter = express.Router();

const mongoose = require('mongoose');
const multer = require('multer');


const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadErr = new Error('invalid image type');

        if (isValid) {
            uploadErr = null
        }

        cb(uploadErr, './public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];

        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
})
const uploadOptions = multer({ storage: storage });

// http://localhost:3000/api/v1/products

/***********************************************************************************
@ GET METHODS
@ Getting all product
*/
productsRouter.get('/all', async (req, res) => {
    // const productList = await Product.find().select('name image -_id');
    const productList = await Product.find().populate('categoryID');

    if (!productList) {
        return res.status(404).json({
            success: false,
            message: 'No Product Found'

        });
    }
    return res.status(200).send(productList);
});


/***********************************************************************************
@ GET METHODS
@ Get A product by its ID
@ populate: Any connected field to another table will be display as details in the field
*/
productsRouter.get('/:id', async (req, res) => {
    // populate: Any connected field to another table will be display as details in the field
    const productList = await Product.findById(req.params.id).populate('categoryID');

    if (!productList) {
        return res.status(404).json({
            success: false,
            message: 'No Product Found'

        });
    }
    return res.status(200).send(productList);
});

/***********************************************************************************
@ POST METHODS
@ Add new product
*/
productsRouter.post('/', uploadOptions.single('image'), async (req, res) => {

    const category = await Category.findById(req.body.categoryID)
    if (!category) return res.status(404).send('Invalid Category');


    const file = req.file;
    if (!file) return res.status(404).send('No image in the request');

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232.jpeg"
        brand: req.body.brand,
        price: req.body.price,
        categoryID: req.body.categoryID,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });

    product = await product.save();

    if (!product) return res.status(404).send('The product cannot be created');

    return res.status(200).send(product);
});

/***********************************************************************************
@ PUT METHODS
@ Update the product using its ID
*/
productsRouter.put('/:id', uploadOptions.single('image'), async (req, res) => {

    // Return an error when we pass invalid id
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('invalid product id');
    }

    const category = await Category.findById(req.body.categoryID)
    if (!category) return res.status(404).send('Invalid Category');

    const product = await Product.findById(req.params.id);
    if (!product)
        return res.status(404).send('The product with the given ID was not Found');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = req.file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            categoryID: req.body.categoryID,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        }, {
        // For returning new updated data 
        new: true
    });

    if (!updatedProduct)
        return res.status(404).send('The product cannot be updated');

    return res.status(200).send(updatedProduct);
});

/***********************************************************************************
@ DELETE METHOD
@ Delete the product using its ID
*/
productsRouter.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product) {
                return res.status(200).json({
                    success: true, message: 'the product is deleted'
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'product not found'
                });
            }
        }).catch(err => {
            return res.status(400).json({
                success: false,
                error: err
            });
        })
});

/***********************************************************************************
@ GET METHODS
@ Count all the product
*/
productsRouter.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments();

    if (!productCount) {
        return res.status(404).json({
            success: false,
            message: 'No Product Found'

        });
    }
    return res.status(200).send({ productCount: productCount });
});


/***********************************************************************************
@ GET METHODS
@ Featured product for homepage 
@ Find with additional query
@ With limitation because featured product may be 1000+
*/
productsRouter.get('/get/featured/:count', async (req, res) => {

    const count = req.params.count ? req.params.count : 0;

    const products = await Product.find({
        isFeatured: true
    }).limit(+count); // Change that string into number

    if (!products) {
        return res.status(404).json({
            success: false,
            message: 'No Product Found'

        });
    }
    return res.status(200).send(products);
})


/***********************************************************************************
@ GET METHODS
@ Getting all the product with filter
@ Using Query Parameter: Always After A Question mark(?) 
@ localhost:3000/api/v1/products?categories=224466,113355
@ Find Query handling Array condition
*/
productsRouter.get('/', async (req, res) => {
    let filter = {};

    if (req.query.categories) {
        filter = { categoryID: req.query.categories.split(',') }
    }
    // console.log(filter);
    const productList = await Product.find(filter).populate('categoryID');

    if (!productList) {
        return res.status(404).json({
            success: false,
            message: 'No Product Found'

        });
    }
    return res.status(200).send(productList);
});


/***********************************************************************************
@ PUT METHODS
@ Update the product Image Gallery
*/
productsRouter.put('/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('invalid product id');
        }

        let imagePaths = [];
        const files = req.files;
        // console.log(files);
        
        const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;

        if (files) {
            files.map(file => {
                imagePaths.push(`${basePath}${file.filename}`);
            })
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagePaths
            }, {
            new: true
        });

        if (!product)
            return res.status(404).send('The product image gallery cannot be updated');

        return res.status(200).send(product);
    });

module.exports = productsRouter;