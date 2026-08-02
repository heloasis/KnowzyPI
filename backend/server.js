const express = require('express');
const path = require('path');
const routes = require('./src/routes/indexRoutes');
const loginRoutes = require('./src/routes/loginRoutes');

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/', loginRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
