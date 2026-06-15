const express = require('express');
const path = require('path');
const routes = require('./routes/indexRoutes');

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, '../views')));

app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});