const express = require('express');
const mogoose = require('mongoose');
const multer = require('multer');
const router = express.Router();

// @destination: Define onde a imagem será salva.
// @filename: Define o nome que a imagem terá ao ser salva, neste
// caso será pela data de upload seguido pelo nome do arquivo.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // Aceita apenas imagens no formato jpeg e png.
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// Especifica a pasta onde o 'multer' tentará armazenar os arquivos que será recebidos por requisições.
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

// Model de product
const Product = require('../models/product');

// Recupera todos os dados dos produtos cadastrados.
router.get('/', (req, res, next) => {
    Product
        .find()
        // Seleciona os atributos que deverão ser retornados para o front-end
        .select('name price _id productImage')
        .exec()
        .then(docs => {
            // Objeto que recebe configurações do que deve ser retornado pra o fron-end
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        productImage: doc.productImage,
                        // Configura um link que leva para os dados de um produto específico, quando clicado
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            };
            console.log(docs);
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', upload.single('productImage'), (req, res, next) => {

    // Recebe os valores vindos com o body da requisição.
    // Estes valores são salvos no mongodb.
    const product = new Product({
        _id: new mogoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Produto criado com sucesso',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

// Recupera os dados de um produto especifico.
router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id')
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        description: 'Retorna todos os produtos',
                        url: 'http://localhost:3000/products'
                    }
                });
            } else {
                res.status(400).json({
                    message: 'Nehum valor encontrado para o ID de entrada'
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

// Atualiza os valores de um produto especifico.
router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;

    // É recebido como paramentro da requisição um array que contem quais dados serão atualizados para o produto.
    // Exemplo: 
    /**
     * [
            {
                "propName": "price", "value": "200"
            }
        ]
     */
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({
        _id: id
    }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Produto atualizado',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

// Apaga um produto especifico.
router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.remove({
        _id: id
    })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Produto excluido',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/products',
                    body: { name: 'String', price: 'Number' }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;