const express = require('express');
const path = require('path');
const app = express();

const authController = require('./src/controllers/authController');
const homeController = require('./src/controllers/homeController');
const materiaController = require('./src/controllers/materiasController');
const quizController = require('./src/controllers/quizController');
const userController = require('./src/controllers/userController');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', authController.index);
app.get('/login', authController.login);
app.get('/cadastro', authController.cadastro);

app.get('/home', homeController.index);
app.get('/home/favoritos', homeController.favoritos);
app.get('/home/conquistas', homeController.conquistas);
app.get('/home/configuracoes', homeController.configuracoes);

app.get('/materias', materiaController.listarMaterias);
app.get('/materias/:id', materiaController.buscarMateria);

app.get('/quiz/:materiaId', quizController.iniciarQuiz);
app.post('/quiz/responder', quizController.responderPergunta);
app.post('/quiz/finalizar', quizController.finalizarQuiz);

app.get('/users/:id', userController.buscarPerfil);
app.put('/users/:id', userController.atualizarPerfil);
app.get('/users/:id/conquistas', userController.buscarConquistas);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});