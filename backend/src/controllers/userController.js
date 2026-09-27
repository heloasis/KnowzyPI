const userModel = require('../models/user');

const buscarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await userModel.buscarPerfil(id);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.status(200).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar perfil.' });
  }
};

const atualizarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    if (!dados.nome) {
      return res.status(400).json({ erro: 'O nome é obrigatório.' });
    }

    const usuario = await userModel.atualizarPerfil(id, dados);

    res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso.',
      usuario
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
  }
};

const buscarConquistas = async (req, res) => {
  try {
    const { id } = req.params;
    const conquistas = await userModel.buscarConquistas(id);
    res.status(200).json(conquistas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar conquistas.' });
  }
};

module.exports = {
  buscarPerfil,
  atualizarPerfil,
  buscarConquistas
};