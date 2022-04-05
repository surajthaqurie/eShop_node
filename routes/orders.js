const { Order } = require('../models/order');
const { OrderItem } = require('../models/orderItem');

const express = require('express');
const ordersRouter = express.Router();

/***********************************************************************************
@ GET METHODS
@ Getting all Orders
*/
ordersRouter.get('/', async (req, res) => {   // table and fields / -1: descending order
    const orderList = await Order.find().populate('user', 'name email').sort({ 'dateOrdered': -1 });

    if (!orderList || orderList.length <= 0) {
        return res.status(500).json({
            success: false,
            message: 'No Order Found!!'

        });
    }
    return res.status(200).send(orderList);
});

/***********************************************************************************
@ GET METHODS
@ Get A Order by its ID
*/
ordersRouter.get('/:id', async (req, res) => {
    const orderList = await Order.findById(req.params.id)
        .populate('user', 'name email')
        // .populate('orderItems');
        // .populate({ path: 'orderItems', populate: 'product' })
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'categoryID'
            }
        });

    if (!orderList) {
        return res.status(404).json({
            success: false,
            message: 'The Order with the given ID was not Found'

        });
    }
    return res.status(200).send(orderList);
});

/***********************************************************************************
@ POST METHODS
@ Add new order
*/

ordersRouter.post('/', async (req, res) => {

    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id
    }));

    const orderItemIdsResolved = await orderItemsIds;
    // console.log(orderItemIdsResolved);

    const totalPrices = await Promise.all(orderItemIdsResolved.map(async orderItemId => {

        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }));

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0)

    let order = new Order({
        orderItems: orderItemIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    });

    order = await order.save();

    if (!order)
        return res.status(404).send('the order cannot be created!');

    return res.status(200).send(order);
});

/***********************************************************************************
@ PUT METHODS
@ Update status of the order using its ID
*/
ordersRouter.put('/:id', async (req, res) => {

    const order = await Order.findByIdAndUpdate(
        req.params.id, {
        status: req.body.status
    }, {
        // For returning new updated data 
        new: true
    });

    if (!order)
        return res.status(404).send('The order with the given ID was not Found');

    return res.status(200).send(order);
});

/***********************************************************************************
@ DELETE METHOD
@ Delete the order using its ID
*/
ordersRouter.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id)
        .then(async order => {
            if (order) {
                await order.orderItems.map(async orderItem => {
                    await OrderItem.findByIdAndRemove(orderItem);
                });

                return res.status(200).json({
                    success: true, message: 'the order is deleted'
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'order not found'
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
@ Get Total Sales
@ Aggregate : Join all the document
@ $Group : Groping all the document as one 
@ $sum: Calculate to sum
*/

ordersRouter.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
    ]);

    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    return res.status(200).send({ totalsales: totalSales.pop().totalsales });
});


/***********************************************************************************
@ GET METHODS
@ Total Count Of The Order
*/
ordersRouter.get('/get/count', async (req, res) => {
    const orderCount = await Order.countDocuments();

    if (!orderCount) {
        return res.status(404).json({
            success: false,
            message: 'No order Found'

        });
    }
    return res.status(200).send({ orderCount: orderCount });
});

/***********************************************************************************
@ GET METHODS
@ Getting all Orders
*/
ordersRouter.get('/get/userorders/:userid', async (req, res) => {   // table and fields / -1: descending order
    const userOrderList = await Order.find({ user: req.params.userid })
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'categoryID'
            }
        })
        .sort({ 'dateOrdered': -1 });

    if (!userOrderList || userOrderList.length <= 0) {
       return res.status(500).json({
            success: false,
            message: 'No Order Found By This User!!'

        });
    }
    return res.status(200).send(userOrderList);
});

module.exports = ordersRouter;