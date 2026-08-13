const homeController = {
  index: (req, res) => {
    res.render('home', { 
      titulo: 'Dashboard',
      usuario: { nome: 'Usuário' }
    });
  },

  favoritos: (req, res) => {
    res.render('favorites', { 
      titulo: 'Meus Favoritos'
    });
  },

  conquistas: (req, res) => {
    res.render('achievements', { 
      titulo: 'Minhas Conquistas'
    });
  },

  configuracoes: (req, res) => {
    res.render('settings', { 
      titulo: 'Configurações do Perfil'
    });
  }
};

module.exports = homeController;