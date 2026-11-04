const userModel = require('../models/user');

const isSafeInternalRedirect = (value) => { if (typeof value !== 'string') { return false; }

const target = value.trim();

if (
    !target ||
    !target.startsWith('/') ||
    target.startsWith('//') ||
    target.includes('\\') ||
    /[\u0000-\u001F\u007F]/.test(target) ||
    /^\/(?:https?:)?\/\//i.test(target)
) {
    return false;
}

return true;


};

const resolveSafeRedirect = (req, fallback = '/home') => { const queryRedirect = req?.query?.redirect; const bodyRedirect = req?.body?.redirectTo; const sessionRedirect = req?.session?.returnTo;

const candidate =
    queryRedirect ||
    bodyRedirect ||
    sessionRedirect ||
    fallback;

return isSafeInternalRedirect(candidate)
    ? candidate.trim()
    : fallback;


};

const authController = {

index: (req, res) => {
    return res.render('index', {
        titulo: 'Página Inicial'
    });
},

login: (req, res) => {
    const redirectTo = resolveSafeRedirect(req, '/home');

    if (req.session) {
        req.session.returnTo = redirectTo;
    }

    return res.render('login', {
        titulo: 'Página de Login',
        redirectTo
    });
},

cadastro: (req, res) => {
    return res.render('cadastro', {
        titulo: 'Página de Cadastro'
    });
},

cadastrarUsuario: async (req, res) => {
    try {
        const { nome, email, senha } = req.body || {};

        const usuario = await userModel.criarUsuario({
            nome,
            email,
            senha
        });

        const redirectTo = resolveSafeRedirect(req, '/home');

        req.session.user = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            xp: Number(usuario.xp || 0),
            conquistas: usuario.conquistas || [],
            foto: ''
        };

        delete req.session.returnTo;

        return req.session.save((error) => {
            if (error) {
                return res.status(500).json({
                    erro: 'Não foi possível finalizar a autenticação.'
                });
            }

            return res.status(201).json({
                mensagem: 'Cadastro realizado com sucesso!',
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    xp: Number(usuario.xp || 0),
                    conquistas: usuario.conquistas || []
                },
                redirectTo
            });
        });

    } catch (error) {
        return res.status(400).json({
            erro: error.message || 'Não foi possível concluir o cadastro.'
        });
    }
},

loginUsuario: async (req, res) => {
    try {
        const { email, senha } = req.body || {};

        const usuario = await userModel.verificarCredenciais({
            email,
            senha
        });

        if (!usuario) {
            return res.status(401).json({
                erro: 'E-mail ou senha inválidos.'
            });
        }

        const redirectTo = resolveSafeRedirect(req, '/home');

        req.session.user = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            xp: Number(usuario.xp || 0),
            conquistas: usuario.conquistas || [],
            foto: ''
        };

        delete req.session.returnTo;

        return req.session.save((error) => {
            if (error) {
                return res.status(500).json({
                    erro: 'Não foi possível finalizar a autenticação.'
                });
            }

            return res.status(200).json({
                mensagem: 'Login realizado com sucesso!',
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    xp: Number(usuario.xp || 0),
                    conquistas: usuario.conquistas || []
                },
                redirectTo
            });
        });

    } catch (error) {
        return res.status(500).json({
            erro: error.message || 'Não foi possível autenticar o usuário.'
        });
    }
}


};

module.exports = authController;