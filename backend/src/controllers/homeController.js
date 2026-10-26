const homeController = {
  index: (req, res) => {
    const usuario = req.session && req.session.user ? req.session.user : { nome: 'Usuário' };

    res.render('home', {
      titulo: 'Dashboard',
      usuario
    });
  },

  favoritos: (req, res) => {
    const usuario = req.session && req.session.user ? req.session.user : { nome: 'Usuário' };

    res.render('home', {
      titulo: 'Meus Favoritos',
      usuario
    });
  },

  conquistas: (req, res) => {
    const usuario = req.session && req.session.user ? req.session.user : { nome: 'Usuário' };

    res.render('home', {
      titulo: 'Minhas Conquistas',
      usuario
    });
  },

  configuracoes: (req, res) => {
    const usuario = req.session && req.session.user ? req.session.user : { nome: 'Usuário' };

    res.render('home', {
      titulo: 'Configurações do Perfil',
      usuario
    });
  }
};

module.exports = homeController;