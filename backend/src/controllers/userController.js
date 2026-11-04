
const userModel = require('../models/user');

const verificarDonoDaConta = (req, res, id) => {
  const usuarioSessao = req.session?.user;

  if (!usuarioSessao) {
    res.status(401).json({
      erro: 'Você precisa fazer login.'
    });
    return false;
  }

  if (String(usuarioSessao.id) !== String(id)) {
    res.status(403).json({
      erro: 'Você não tem permissão para acessar esta conta.'
    });
    return false;
  }

  return true;
};

// Não envia hash de senha ao navegador.
const dadosPublicos = (usuario) => {
  if (!usuario) return null;

  const {
    senha,
    ...dados
  } = usuario;

  return dados;
};

const buscarPerfil = async (req, res) => {
  try {
    const { id } = req.params;

    if (!verificarDonoDaConta(req, res, id)) return;

    const usuario = await userModel.buscarPerfil(id);

    if (!usuario) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.'
      });
    }

    return res.status(200).json(dadosPublicos(usuario));

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);

    return res.status(500).json({
      erro: 'Erro ao buscar perfil.'
    });
  }
};

const atualizarPerfil = async (req, res) => {
  try {
    const { id } = req.params;

    if (!verificarDonoDaConta(req, res, id)) return;

    const usuarioAtual = await userModel.buscarPerfil(id);

    if (!usuarioAtual) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.'
      });
    }

    const body = req.body || {};
    const dados = {};

    // Só permite alterar os campos autorizados.
    if (typeof body.nome === 'string') {
      const nome = body.nome.trim();

      if (!nome) {
        return res.status(400).json({
          erro: 'O nome não pode ficar vazio.'
        });
      }

      dados.nome = nome;
      dados.perfil = {
        ...usuarioAtual.perfil,
        nome
      };
    }

    if (body.mascote && typeof body.mascote === 'object') {
      dados.mascote = {
        ...usuarioAtual.mascote,
        roupa: body.mascote.roupa ?? usuarioAtual.mascote.roupa,
        acessorio: body.mascote.acessorio ?? usuarioAtual.mascote.acessorio,
        expressao: body.mascote.expressao ?? usuarioAtual.mascote.expressao,
        efeito: body.mascote.efeito ?? usuarioAtual.mascote.efeito,
        cor: body.mascote.cor ?? usuarioAtual.mascote.cor
      };
    }

    if (body.favoritos && typeof body.favoritos === 'object') {
      dados.favoritos = body.favoritos;
    }

    if (Object.keys(dados).length === 0) {
      return res.status(400).json({
        erro: 'Nenhum dado válido foi enviado.'
      });
    }

    const usuario = await userModel.atualizarPerfil(id, dados);

    // Atualiza o nome da sessão quando ele for alterado.
    if (dados.nome) {
      req.session.user.nome = dados.nome;

      await new Promise((resolve, reject) => {
        req.session.save((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    return res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso.',
      usuario: dadosPublicos(usuario)
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);

    return res.status(500).json({
      erro: 'Erro ao atualizar perfil.'
    });
  }
};

const buscarConquistas = async (req, res) => {
  try {
    const { id } = req.params;

    if (!verificarDonoDaConta(req, res, id)) return;

    const usuario = await userModel.buscarPerfil(id);

    if (!usuario) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.'
      });
    }

    return res.status(200).json(
      usuario.conquistas || []
    );

  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);

    return res.status(500).json({
      erro: 'Erro ao buscar conquistas.'
    });
  }
};

module.exports = {
  buscarPerfil,
  atualizarPerfil,
  buscarConquistas
};
