const materiaModel = require('../models/materias');

const listarMaterias = async (req, res) => {
  try {
    const materias = (await materiaModel.listarMaterias()) || [];
    return res.render('materias', { materias, isQuiz: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao listar matérias.' });
  }
};

const listarQuizzes = async (req, res) => {
  try {
    const materias = (await materiaModel.listarMaterias()) || [];
    return res.render('materias', { materias, isQuiz: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Erro ao listar quizzes.');
  }
};

const listarMateriasApi = async (req, res) => {
  try {
    const materias = (await materiaModel.listarMaterias()) || [];
    return res.status(200).json({ materias });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao listar matérias.' });
  }
};

const buscarMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const materia = await materiaModel.buscarMateria(id);

    if (!materia) {
      return res.status(404).json({ erro: 'Matéria não encontrada.' });
    }

    const conteudo = materiaModel.listarConteudos(id);
    if (!conteudo) return res.status(404).send('Conteúdo de estudo não encontrado.');
    return res.render('estudo', { materia: conteudo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar matéria.' });
  }
};

const listarConteudosApi = async (req, res) => {
  try {
    const conteudo = materiaModel.listarConteudos(req.params.id);
    if (!conteudo) return res.status(404).json({ erro: 'Conteúdo não encontrado.' });
    return res.status(200).json({ materia: conteudo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar conteúdos.' });
  }
};

const buscarMateriaApi = async (req, res) => {
  try {
    const { id } = req.params;
    const materia = await materiaModel.buscarMateria(id);

    if (!materia) {
      return res.status(404).json({ erro: 'Matéria não encontrada.' });
    }

    return res.status(200).json({ materia });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao buscar matéria.' });
  }
};

module.exports = {
  listarMaterias,
  listarQuizzes,
  listarMateriasApi,
  buscarMateria,
  buscarMateriaApi,
  listarConteudosApi
};