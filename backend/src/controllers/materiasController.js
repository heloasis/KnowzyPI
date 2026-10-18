const materiaModel = require('../models/materias');

const listarMaterias = async (req, res) => {
  try {
    const materias = (await materiaModel.listarMaterias()) || [];
    return res.render('materias', { materias });
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

    res.status(200).json(materia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar matéria.' });
  }
};

module.exports = {
  listarMaterias,
  buscarMateria
};