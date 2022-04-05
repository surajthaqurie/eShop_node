const { Category } = require('../models/category');
const express = require('express');
const categoriesRouter = express.Router();

/***********************************************************************************
@ GET METHODS
@ Getting all categories
*/
categoriesRouter.get('/', async (req, res) => {
    const categoryList = await Category.find();

    if (!categoryList) {
        res.status(404).json({
            success: false,
            message: 'The categories is not Found'

        });
    }
    return res.status(200).send(categoryList);
});

/***********************************************************************************
@ GET METHODS
@ Get A category by its ID
*/
categoriesRouter.get('/:id', async (req, res) => {
    const categoryList = await Category.findById(req.params.id);

    if (!categoryList) {
        res.status(404).json({
            success: false,
            message: 'The category with the given ID was not Found'

        });
    }
    return res.status(200).send(categoryList);
});


/***********************************************************************************
@ POST METHODS
@ Add new category
*/
categoriesRouter.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });

    category = await category.save();

    if (!category)
        return res.status(404).send('the category cannot be created!');

    return res.status(200).send(category);
});

/***********************************************************************************
@ PUT METHODS
@ Update the category using its ID
*/
categoriesRouter.put('/:id', async (req, res) => {

    const category = await Category.findByIdAndUpdate(
        req.params.id, {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    }, {
        // For returning new updated data 
        new: true
    });

    if (!category)
        return res.status(404).send('The category with the given ID was not Found');

    return res.status(200).send(category);
});

/***********************************************************************************
@ DELETE METHOD
@ Delete the category using its ID
*/
categoriesRouter.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id)
        .then((category) => {
            if (category) {
                return res.status(200).json({
                    success: true, message: 'the category is deleted'
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'category not found'
                });
            }
        }).catch(err => {
            return res.status(400).json({
                success: false,
                error: err
            });
        })
});


module.exports = categoriesRouter;