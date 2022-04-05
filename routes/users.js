const { User } = require('../models/user');
const express = require('express');
const usersRouter = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/***********************************************************************************
@ GET METHODS
@ Getting all Users
*/
usersRouter.get('/', async (req, res) => {
    // const userList = await User.find().select('name phone email');
    const userList = await User.find().select('-password');

    if (!userList || userList.length <= 0) {
        return res.status(404).json({
            success: false,
            message: ' User no Found!'
        });
    }
    return res.status(200).send(userList);

});

/***********************************************************************************
@ GET METHODS
@ Get A user by its ID
*/
usersRouter.get('/:id', async (req, res) => {
    const userList = await User.findById(req.params.id).select('-password');

    if (!userList) {
        return res.status(404).json({
            success: false,
            message: 'No user Found'

        });
    }
    return res.status(200).send(userList);
});

/***********************************************************************************
@ POST METHODS
@ Add new User
*/
usersRouter.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });

    user = await user.save();

    if (!user)
        return res.status(404).send('the user cannot be created!');

    return res.status(200).send(user);
});

/***********************************************************************************
@ DELETE METHOD
@ Delete the User using its ID
*/
usersRouter.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id)
        .then((user) => {
            if (user) {
                return res.status(200).json({
                    success: true, message: 'the user is deleted'
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'user not found'
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
@ POST METHODS
@ Login User
*/
usersRouter.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).send('The user Not found!');
    }

    if (user && bcrypt.compareSync(req.body.password, user.password)) {

        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            process.env.SECRET,
            {
                expiresIn: '1d'  // '1d': 1day / '1w': week
            }
        );
        return res.status(200).send({ user: user.email, token: token });
    } else {

        return res.status(400).send('Password is Wrong!!');
    }
});

/***********************************************************************************
@ POST METHODS
@ Register User
*/

usersRouter.post('/register', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });

    user = await user.save();

    if (!user)
        return res.status(404).send('the user cannot be created!');

    return res.status(200).send(user);
});


/***********************************************************************************
@ GET METHODS
@ Count all the User
*/
usersRouter.get('/get/count', async (req, res) => {
    const userCount = await User.countDocuments();

    if (!userCount) {
        return res.status(404).json({
            success: false,
            message: 'No User Found'

        });
    }
    return res.status(200).send({ userCount: userCount });
});


module.exports = usersRouter;