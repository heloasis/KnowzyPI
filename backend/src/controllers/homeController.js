const homeController = {
  index: (req, res) => {
    res.render('home', {
      titulo: 'Dashboard',
      usuario: { nome: 'Usuário' }
    });
  },

  favoritos: (req, res) => {
    res.render('home', {
      titulo: 'Meus Favoritos',
      usuario: { nome: 'Usuário' }
    });
  },

  conquistas: (req, res) => {
    res.render('home', {
      titulo: 'Minhas Conquistas',
      usuario: { nome: 'Usuário' }
    });
  },

  configuracoes: (req, res) => {
    res.render('home', {
      titulo: 'Configurações do Perfil',
      usuario: { nome: 'Usuário' }
    });
  }
};

module.exports = homeController;