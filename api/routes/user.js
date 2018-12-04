const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Utilizado para criptografar a senha do usuário.
const bcrypt = require('bcrypt');

// Utilizado para criar Tokens de sessão para o usuário que estiver logado.
const jwt = require('jsonwebtoken');

const User = require('../models/users');

router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            // Apenas irá cadastrar um novo usuário se o novo email ainda não estiver em uso.
            if (user.length >= 1) {
                // Caso o email já esteja cadastrado, o cod: 409(Conflito) é enviado ao cliente.
                return res.status(409).json({
                    message: 'Mail exists'
                });
            } else {
                // Criptografa a senha do usuário, se a operação for bem sucedida, os dados do usuário são armazenados no banco.
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        console.log(user);
                        user
                            .save()
                            .then(result => {
                                res.status(201).json({
                                    message: 'User Created'
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });
            }
        })
        .catch();
});

router.post('/login', (req, res, next) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            // Verifica se o ID da requisição é o mesmo que está armazenado no Banco.
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            email: user.email,
                            userId: user._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: '1h'
                        }
                    );
                    return res.status(200).header('token', token).json({
                        message: 'Auth successful'
                    });
                }
                return res.status(401).json({
                    message: 'Auth failed'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:userId', (req, res, next) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User deleted'
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