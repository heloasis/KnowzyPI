const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/conquistas', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'public', 'conquistas', 'index.html')
  );
});

app.listen(3000, () => {
  console.log('Knowzy disponível em http://localhost:3000');
});