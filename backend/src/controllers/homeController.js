const materiaModel = require('../models/materias');

const homeController = {
  index: (req, res) => {
    const usuario = req.session?.user;
    if (!usuario) return res.redirect('/login');

    res.render('home', {
      titulo: 'Dashboard',
      usuario
    });
  },

  favoritos: async (req, res) => {
    try {
      const usuario = req.session?.user;
    if (!usuario) return res.redirect('/login');
      const materias = (await materiaModel.listarMaterias()) || [];

      res.render('favoritos', {
        titulo: 'Meus Favoritos',
        usuario,
        materias
      });
    } catch (error) {
      console.error(error);
      res.status(500).render('favoritos', {
        titulo: 'Meus Favoritos',
        usuario: req.session?.user || null,
        materias: []
      });
    }
  },

  conquistas: (req, res) => {
    const usuario = req.session?.user;
    if (!usuario) return res.redirect('/login');

    res.render('home', {
      titulo: 'Minhas Conquistas',
      usuario
    });
  },

  configuracoes: (req, res) => {
    const usuario = req.session?.user;
    if (!usuario) return res.redirect('/login');

    res.render('home', {
      titulo: 'Configurações do Perfil',
      usuario
    });
  }
};

module.exports = homeController;