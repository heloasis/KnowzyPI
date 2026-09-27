const auth = require('./src/routes/authRoutes');
const home = require('./src/routes/homeRoutes');
const mat = require('./src/routes/materiaRoutes');
const quiz = require('./src/routes/quizRoutes');
const user = require('./src/routes/userRoutes');
const materiasController = require('./src/controllers/materiasController');
const quizController = require('./src/controllers/quizController');
const userController = require('./src/controllers/userController');

console.log('auth', typeof auth, auth && auth.stack ? 'router' : 'other');
console.log('home', typeof home, home && home.stack ? 'router' : 'other');
console.log('mat', typeof mat, mat && mat.stack ? 'router' : 'other');
console.log('quiz', typeof quiz, quiz && quiz.stack ? 'router' : 'other');
console.log('user', typeof user, user && user.stack ? 'router' : 'other');
console.log('matCtrl', typeof materiasController);
console.log('quizCtrl', typeof quizController);
console.log('userCtrl', typeof userController);
