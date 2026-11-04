const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

const { normalizeUtf8Value } = require('./src/utils/utf8');

const authController = require('./src/controllers/authController');
const homeController = require('./src/controllers/homeController');
const materiaController = require('./src/controllers/materiasController');
const quizController = require('./src/controllers/quizController');
const userController = require('./src/controllers/userController');
const {
  requireAuth,
  requireGuest,
  requireOwnership
} = require('./src/middlewares/authMiddleware');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => originalJson(normalizeUtf8Value(body));
  res.charset = 'utf-8';
  next();
});
app.use(session({
  secret: process.env.SESSION_SECRET || 'knowzy-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', authController.index);
app.get('/login', requireGuest, authController.login);
app.post('/login', requireGuest, authController.loginUsuario);
app.get('/cadastro', requireGuest, authController.cadastro);
app.post('/cadastro', requireGuest, authController.cadastrarUsuario);

app.use(['/api', '/home', '/favoritos', '/perfil', '/materias', '/quiz', '/conquistas', '/users'], requireAuth);

app.get('/home', homeController.index);
app.get('/favoritos', homeController.favoritos);
app.get('/home/favoritos', homeController.favoritos);
app.get('/home/conquistas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'conquistas', 'index.html'));
});
app.get('/home/configuracoes', homeController.configuracoes);
app.get('/conquistas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'conquistas', 'index.html'));
});
app.get('/perfil', (req, res) => {
  const usuario = req.session && req.session.user ? req.session.user : {
    nome: 'Usuário',
    email: 'usuario@email.com',
    foto: ''
  };

  res.render('perfil', { usuario });
});
app.get('/perfil/', (req, res) => {
  res.redirect('/perfil');
});
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/materias', materiaController.listarMaterias);
app.get('/materias/:id', materiaController.buscarMateria);
app.get('/api/materias', materiaController.listarMateriasApi);
app.get('/api/materias/:id', materiaController.buscarMateriaApi);

app.get('/quiz', materiaController.listarMaterias);
app.get('/quiz/portugues', (req, res) => {
  res.render('portugues');
});
app.get('/quiz/matematica', (req, res) => {
  res.render('matematica');
});
app.get('/quiz/historia', (req, res) => {
  res.render('historia');
});
app.get('/quiz/geografia', (req, res) => {
  res.render('geografia');
});
app.get('/quiz/biologia', (req, res) => {
  res.render('biologia');
});
app.get('/api/quiz/:materiaId', quizController.iniciarQuiz);
app.post('/quiz/responder', quizController.responderPergunta);
app.post('/quiz/finalizar', quizController.finalizarQuiz);

app.get('/users/:id', requireOwnership('id'), userController.buscarPerfil);
app.put('/users/:id', requireOwnership('id'), userController.atualizarPerfil);
app.get('/users/:id/conquistas', requireOwnership('id'), userController.buscarConquistas);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
  });
}