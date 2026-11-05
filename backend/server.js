require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

const { normalizeUtf8Value } = require('./src/utils/utf8');

const authController = require('./src/controllers/authController');
const homeController = require('./src/controllers/homeController');
const materiaController = require('./src/controllers/materiasController');
const quizController = require('./src/controllers/quizController');
const userRoutes = require('./src/routes/userRoutes');
const quizRoutes = require('./src/routes/quizRoutes');
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
  secret: process.env.SESSION_SECRET || 'dev-only-change-this-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use((req, res, next) => {
  res.locals.usuario = req.session?.user || null;
  next();
});

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
  if (!req.session?.user) return res.redirect('/login');
  res.render('perfil', { usuario: req.session.user });
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
app.get('/api/materias/:id/conteudos', materiaController.listarConteudosApi);
app.get('/api/materias/:id', materiaController.buscarMateriaApi);

app.get('/tutor-ia', (req, res) => res.render('tutor'));
app.get('/quiz', materiaController.listarQuizzes);
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
app.use('/api/quiz', quizRoutes);
app.get('/api/quiz/:materiaId', quizController.iniciarQuiz);
app.post('/quiz/responder', quizController.responderPergunta);
app.post('/quiz/finalizar', quizController.finalizarQuiz);





app.use('/users', userRoutes);

app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ erro: 'Endpoint nÃ£o encontrado.' });
  return res.status(404).send('PÃ¡gina nÃ£o encontrada.');
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
  });
}

