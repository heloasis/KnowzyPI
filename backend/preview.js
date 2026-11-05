
const express = require('express');
const path = require('path');
const https = require('https');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const usuarioTeste = {
  nome: 'Amanda'
};

const FIREBASE_URL =
  'https://knowzypi-default-rtdb.firebaseio.com';

const materiasPermitidas = [
  'biologia',
  'geografia',
  'historia',
  'matematica',
  'portugues'
];

// Consulta os dados originais pela API REST.
function buscarDadosFirebase(caminho) {
  return new Promise((resolve, reject) => {
    https.get(`${FIREBASE_URL}/${caminho}.json`, (response) => {
      let dados = '';

      response.on('data', (parte) => {
        dados += parte;
      });

      response.on('end', () => {
        if (response.statusCode >= 400) {
          reject(new Error(`Firebase: status ${response.statusCode}`));
          return;
        }

        try {
          resolve(dados ? JSON.parse(dados) : null);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Carrega as matérias reais.
async function carregarMaterias() {
  const dados = await buscarDadosFirebase('materias');

  if (!dados) return [];

  return Object.entries(dados).map(([id, materia]) => ({
    id,
    slug: id.toLowerCase(),
    ...materia
  }));
}

// Home
app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/home', (req, res) => {
  res.render('home', {
    usuario: usuarioTeste
  });
});

// Matérias
app.get('/materias', async (req, res) => {
  try {
    const materias = await carregarMaterias();

    res.render('materias', {
      titulo: 'Matérias',
      usuario: usuarioTeste,
      materias
    });
  } catch (error) {
    console.error('Erro ao carregar matérias:', error.message);
    res.status(500).send('Não foi possível carregar as matérias originais.');
  }
});

// Favoritos
app.get('/favoritos', async (req, res) => {
  try {
    const materias = await carregarMaterias();

    res.render('favoritos', {
      titulo: 'Meus Favoritos',
      usuario: usuarioTeste,
      materias
    });
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error.message);
    res.status(500).send('Não foi possível carregar os favoritos.');
  }
});

// Quiz original de cada matéria
app.get('/quiz/:materia', (req, res) => {
  const materia = req.params.materia.toLowerCase();

  if (!materiasPermitidas.includes(materia)) {
    return res.status(404).send('Matéria não encontrada.');
  }

  res.render(materia, {
    usuario: usuarioTeste,
    materia
  });
});

// Atalhos para abrir os quizzes diretamente
materiasPermitidas.forEach((materia) => {
  app.get(`/${materia}`, (req, res) => {
    res.redirect(`/quiz/${materia}`);
  });
});

// Outras páginas originais
const paginas = [
  'index',
  'login',
  'cadastro',
  'perfil',
  'conquistas'
];

paginas.forEach((pagina) => {
  app.get('/' + pagina, (req, res) => {
    res.render(pagina, {
      usuario: usuarioTeste
    }, (erro, html) => {
      if (erro) {
        console.error(`Erro em ${pagina}:`, erro.message);
        return res.status(500).send(
          `Não foi possível abrir ${pagina}: ${erro.message}`
        );
      }

      res.send(html);
    });
  });
});

app.listen(3000, () => {
  console.log('Preview do Knowzy: http://localhost:3000');
});
