const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');

// Configura a conexão com o mongodb Atlas.
// Senha: node-shop
mongoose.connect('mongodb://node-shop:' + process.env.MONGO_ATLAS_PW +
'@node-rest-shop-shard-00-00-4amk7.mongodb.net:27017,node-rest-shop-shard-00-01-4amk7.mongodb.net:27017,node-rest-shop-shard-00-02-4amk7.mongodb.net:27017/test?ssl=true&replicaSet=node-rest-shop-shard-0&authSource=admin&retryWrites=true', {
        useMongoClient: true
    });

// Retorna os dados gerados por uma requisição (tempo, status).
app.use(morgan('dev'));

// Permite que a pasta de uploads seja acessada através de localhost:3000/uploads/:idImage.
app.use('/uploads', express.static('uploads'));

// Define os tipos de requisição que serão aceitas pela api.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configurações para CORS.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Raiz de acesso para cada uma das rotas da API.
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

// Métodos que atuam sobre os erros que podem acontecer durante uma requisição.
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status(404);
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;