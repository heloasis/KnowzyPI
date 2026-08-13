const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const routes = require('./src/routes/authRoutes');
const loginRoutes = require('./src/routes/authRoutes'); 
const homeRoutes = require('./src/routes/homeRoutes'); 

app.use('/', routes);
app.use('/login', loginRoutes);
app.use('/home', homeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});