//Controla Telas 1, 2 e 3 (Index, Login, Cadastro)

const path = require('path');

const authController = {
    index: (req, res) => {
        res.render('index', { titulo: 'Página Inicial' });
    },

    login: (req, res) => {
        res.render('login', { titulo: 'Página de Login' });
    },

    cadastro: (req, res) => {
        res.render('cadastro', { titulo: 'Página de Cadastro' });
    }
};

module.exports = authController;