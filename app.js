require('dotenv/config');

const express = require('express');
const app = express();

const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');


// Middleware
app.use(cors());
// some type of http request * : allowing everything(all other http request)
app.options('*', cors());

app.use(express.json());
app.use(morgan('tiny'));

app.use(authJwt());
app.use(errorHandler);

// This is public path
app.use('/public/upload', express.static(__dirname + '/public/uploads'));

// Routes
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const ordersRouter = require('./routes/orders');
const usersRouter = require('./routes/users');
const res = require('express/lib/response');

const api = process.env.API_URL;

app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);


// DataBase
/* 
const DB_ATLAS_USERNAME = 'nodeCourses';
const DB_ATLAS_PASSWORD = 'nodeCourses123';
const MONGO_URL = `mongodb+srv://${DB_ATLAS_USERNAME}:${DB_ATLAS_PASSWORD}@nodecourses.isale.mongodb.net/db-Eshop?retryWrites=true&w=majority`;
*/
const MONGO_URL = 'mongodb://localhost/db-Eshop';

try {
    // Connect to the MongoDB cluster
    mongoose.connect(
        // process.env.DB_CONNECTION,
        MONGO_URL,
        { useNewUrlParser: true, useUnifiedTopology: true },
        () => console.log("Database is connected")
    );

} catch (e) {
    console.log("Database could not connect");
}

const PORT = process.env.PORT || 3000;
// Server
app.listen(PORT, () => {
    console.log(`Server is running http://localhost:${PORT}`);
});