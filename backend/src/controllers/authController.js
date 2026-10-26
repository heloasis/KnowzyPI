//Controla Telas 1, 2 e 3 (Index, Login, Cadastro)

const userModel = require('../models/user');

const authController = {
    index: (req, res) => {
        res.render('index', { titulo: 'Página Inicial' });
    },

    login: (req, res) => {
        res.render('login', { titulo: 'Página de Login' });
    },

    cadastro: (req, res) => {
        res.render('cadastro', { titulo: 'Página de Cadastro' });
    },

    cadastrarUsuario: async (req, res) => {
        try {
            const { nome, email, senha } = req.body || {};
            const usuario = await userModel.criarUsuario({ nome, email, senha });

            req.session.user = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                foto: ''
            };

            return res.status(201).json({
                mensagem: 'Cadastro realizado com sucesso!',
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email
                }
            });
        } catch (error) {
            const mensagem = error.message || 'Não foi possível concluir o cadastro.';
            return res.status(400).json({ erro: mensagem });
        }
    },

    loginUsuario: async (req, res) => {
        try {
            const { email, senha } = req.body || {};
            const usuario = await userModel.verificarCredenciais({ email, senha });

            if (!usuario) {
                return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
            }

            req.session.user = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                foto: ''
            };

            return res.status(200).json({
                mensagem: 'Login realizado com sucesso!',
                usuario
            });
        } catch (error) {
            const mensagem = error.message || 'Não foi possível autenticar o usuário.';
            return res.status(500).json({ erro: mensagem });
        }
    }
};

module.exports = authController;