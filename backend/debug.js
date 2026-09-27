const auth = require('./src/routes/authRoutes');
const home = require('./src/routes/homeRoutes');
const mat = require('./src/routes/materiaRoutes');
const quiz = require('./src/routes/quizRoutes');
const user = require('./src/routes/userRoutes');

console.log('auth', auth && auth.stack ? 'router' : typeof auth);
console.log('home', home && home.stack ? 'router' : typeof home);
console.log('mat', mat && mat.stack ? 'router' : typeof mat);
console.log('quiz', quiz && quiz.stack ? 'router' : typeof quiz);
console.log('user', user && user.stack ? 'router' : typeof user);
