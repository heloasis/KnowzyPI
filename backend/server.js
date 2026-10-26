const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

const authController = require('./src/controllers/authController');
const homeController = require('./src/controllers/homeController');
const materiaController = require('./src/controllers/materiasController');
const quizController = require('./src/controllers/quizController');
const userController = require('./src/controllers/userController');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'knowzy-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', authController.index);
app.get('/login', authController.login);
app.post('/login', authController.loginUsuario);
app.get('/cadastro', authController.cadastro);
app.post('/cadastro', authController.cadastrarUsuario);

app.get('/home', homeController.index);
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
    res.redirect('/login');
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/materias', materiaController.listarMaterias);
app.get('/materias/:id', materiaController.buscarMateria);

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

app.get('/users/:id', userController.buscarPerfil);
app.put('/users/:id', userController.atualizarPerfil);
app.get('/users/:id/conquistas', userController.buscarConquistas);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});