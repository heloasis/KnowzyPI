
const bcrypt = require('bcrypt');
const { db } = require('../config/firebase');

const validarEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email || '').trim()
  );

const validarSenha = (senha) => {
  if (typeof senha !== 'string') return false;

  return (
    senha.length >= 8 &&
    /[A-Za-z]/.test(senha) &&
    /\d/.test(senha) &&
    /[^A-Za-z\d]/.test(senha)
  );
};

const normalizarConquistas = (conquistas = []) => {
  if (Array.isArray(conquistas)) {
    return [...new Set(
      conquistas
        .filter(Boolean)
        .map((item) => String(item).trim())
        .filter(Boolean)
    )];
  }

  // Compatibilidade com registros antigos em formato de objeto.
  if (conquistas && typeof conquistas === 'object') {
    return Object.entries(conquistas)
      .filter(([, valor]) =>
        valor === true || valor?.concluida === true
      )
      .map(([id]) => id);
  }

  return [];
};

const normalizarMateriasExploradas = (materias = []) => {
  if (!Array.isArray(materias)) return [];

  return [...new Set(
    materias.filter(Boolean).map(String)
  )];
};

const calcularConquistasDoUsuario = ({
  xp = 0,
  conquistas = [],
  totalQuizzes = 0,
  materiasExploradas = [],
  ultimaPontuacao = 0
} = {}) => {
  const xpTotal = Number(xp) || 0;
  const lista = normalizarConquistas(conquistas);
  const countQuizzes = Number(totalQuizzes) || 0;
  const materias = normalizarMateriasExploradas(
    materiasExploradas
  );
  const score = Number(ultimaPontuacao) || 0;

  if (xpTotal >= 25) lista.push('primeiro_login');
  if (countQuizzes >= 50) lista.push('cinquenta_quizzes');
  if (materias.length >= 5) lista.push('explorar_materias');
  if (countQuizzes >= 5) lista.push('cinco_quizzes');
  if (score >= 100) lista.push('licao_perfeita');

  return {
    xp: xpTotal,
    totalQuizzes: countQuizzes,
    materiasExploradas: materias,
    ultimaPontuacao: score,
    conquistas: normalizarConquistas(lista)
  };
};

const normalizarUsuario = (usuario = {}) => ({
  ...usuario,
  id: usuario.id,
  nome: usuario.nome || usuario.perfil?.nome || 'Usuário',
  email: usuario.email || '',
  xp: Number(usuario.xp ?? usuario.perfil?.xpTotal ?? 0),
  totalQuizzes: Number(usuario.totalQuizzes || 0),
  materiasExploradas: normalizarMateriasExploradas(
    usuario.materiasExploradas
  ),
  ultimaPontuacao: Number(usuario.ultimaPontuacao || 0),
  conquistas: normalizarConquistas(usuario.conquistas),
  perfil: {
    ...(usuario.perfil || {}),
    nome: usuario.perfil?.nome || usuario.nome || 'Usuário',
    xpTotal: Number(
      usuario.perfil?.xpTotal ?? usuario.xp ?? 0
    ),
    nivelAtual: usuario.perfil?.nivelAtual || 'Iniciante'
  },
  mascote: usuario.mascote || {
    roupa: 'casaco_roto',
    acessorio: 'fone_ouvido',
    expressao: 'piscada',
    efeito: 'galaxia',
    cor: 'roxo'
  },
  favoritos: usuario.favoritos || {}
});

const buscarPerfil = async (id) => {
  if (!id) return null;

  const snapshot = await db.ref(`usuarios/${id}`).once('value');
  const usuario = snapshot.val();

  if (!usuario) return null;

  return normalizarUsuario({ id, ...usuario });
};

const atualizarPerfil = async (id, dados = {}) => {
  if (!id || !dados || typeof dados !== 'object') {
    throw new Error('Usuário ou dados inválidos.');
  }

  const usuarioAtual = await buscarPerfil(id);

  if (!usuarioAtual) return null;

  const atualizacao = { ...dados };

  // Mantém nome e XP sincronizados com o perfil.
  if (dados.nome !== undefined || dados.xp !== undefined) {
    atualizacao.perfil = {
      ...usuarioAtual.perfil,
      ...(dados.perfil || {}),
      ...(dados.nome !== undefined
        ? { nome: dados.nome }
        : {}),
      ...(dados.xp !== undefined
        ? { xpTotal: Number(dados.xp) }
        : {})
    };
  }

  if (dados.conquistas !== undefined) {
    atualizacao.conquistas = normalizarConquistas(
      dados.conquistas
    );
  }

  await db.ref(`usuarios/${id}`).update(atualizacao);

  return buscarPerfil(id);
};

const buscarConquistas = async (id) => {
  const snapshot = await db
    .ref(`usuarios/${id}/conquistas`)
    .once('value');

  return normalizarConquistas(snapshot.val());
};

const listarUsuarios = async () => {
  const snapshot = await db.ref('usuarios').once('value');
  const usuarios = snapshot.val() || {};

  return Object.entries(usuarios).map(([id, usuario]) =>
    normalizarUsuario({ id, ...usuario })
  );
};

const buscarPorEmail = async (email) => {
  const emailNormalizado = String(email || '')
    .trim()
    .toLowerCase();

  if (!emailNormalizado) return null;

  const usuarios = await listarUsuarios();

  return usuarios.find(
    (usuario) =>
      String(usuario.email || '').trim().toLowerCase() ===
      emailNormalizado
  ) || null;
};

const criarUsuario = async ({ nome, email, senha }) => {
  const nomeValido = String(nome || '').trim();
  const emailValido = String(email || '').trim().toLowerCase();

  if (!nomeValido) {
    throw new Error('O nome completo é obrigatório.');
  }

  if (!validarEmail(emailValido)) {
    throw new Error('Informe um e-mail válido.');
  }

  if (!validarSenha(senha)) {
    throw new Error(
      'A senha deve ter pelo menos 8 caracteres, incluindo letras, números e símbolos.'
    );
  }

  const usuarioExistente = await buscarPorEmail(emailValido);

  if (usuarioExistente) {
    throw new Error('Este e-mail já está registrado.');
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const ref = db.ref('usuarios').push();
  const id = ref.key;

  const usuario = {
    nome: nomeValido,
    email: emailValido,
    senha: senhaHash,

    xp: 0,
    totalQuizzes: 0,
    materiasExploradas: [],
    ultimaPontuacao: 0,
    conquistas: [],

    perfil: {
      nome: nomeValido,
      tag: `usuario_${id.slice(-6)}`,
      nivelAtual: 'Iniciante',
      xpTotal: 0
    },

    mascote: {
      roupa: 'casaco_roto',
      acessorio: 'fone_ouvido',
      expressao: 'piscada',
      efeito: 'galaxia',
      cor: 'roxo'
    },

    favoritos: {},

    progressoConquistas: {}
  };

  await ref.set(usuario);

  return normalizarUsuario({ id, ...usuario });
};

const atualizarXpUsuario = async (
  id,
  xpAdicional = 0,
  progressoExtra = {}
) => {
  const usuarioAtual = await buscarPerfil(id);

  if (!usuarioAtual) return null;

  const xpAtual = Number(usuarioAtual.xp || 0);
  const proximoXp = Math.max(
    0,
    xpAtual + Number(xpAdicional || 0)
  );

  const totalQuizzesAtual = Number(usuarioAtual.totalQuizzes || 0);
  const totalQuizzesFinal =
    progressoExtra.totalQuizzes !== undefined
      ? Number(progressoExtra.totalQuizzes || 0)
      : totalQuizzesAtual + 1;

  const materiasBase = normalizarMateriasExploradas(usuarioAtual.materiasExploradas);
  const materiasNovas = normalizarMateriasExploradas(progressoExtra.materiasExploradas);
  const materiasFinal = normalizarMateriasExploradas([
    ...materiasBase,
    ...materiasNovas
  ]);

  const ultimaPontuacaoAtual = Number(usuarioAtual.ultimaPontuacao || 0);
  const ultimaPontuacaoFinal =
    progressoExtra.ultimaPontuacao !== undefined
      ? Math.max(
          ultimaPontuacaoAtual,
          Number(progressoExtra.ultimaPontuacao || 0)
        )
      : ultimaPontuacaoAtual;

  const progresso = calcularConquistasDoUsuario({
    xp: proximoXp,
    conquistas: usuarioAtual.conquistas,
    totalQuizzes: totalQuizzesFinal,
    materiasExploradas: materiasFinal,
    ultimaPontuacao: ultimaPontuacaoFinal
  });

  const nivelAtual =
    proximoXp >= 3000 ? 'Lenda' :
    proximoXp >= 1500 ? 'Mestre' :
    proximoXp >= 1000 ? 'Sábio' :
    proximoXp >= 500 ? 'Aventureiro' :
    'Iniciante';

  await atualizarPerfil(id, {
    xp: progresso.xp,
    totalQuizzes: progresso.totalQuizzes,
    materiasExploradas: progresso.materiasExploradas,
    ultimaPontuacao: progresso.ultimaPontuacao,
    conquistas: progresso.conquistas,
    perfil: {
      ...usuarioAtual.perfil,
      xpTotal: progresso.xp,
      nivelAtual
    }
  });

  return buscarPerfil(id);
};

const verificarCredenciais = async ({ email, senha }) => {
  const usuario = await buscarPorEmail(email);

  if (!usuario || !usuario.senha) return null;

  // Aceita somente senhas armazenadas com bcrypt.
  const senhaCorreta = await bcrypt.compare(
    String(senha || ''),
    usuario.senha
  );

  if (!senhaCorreta) return null;

  const atualizado = aplicarPremioLogin(usuario);

  await atualizarPerfil(usuario.id, {
    xp: atualizado.xp,
    totalQuizzes: atualizado.totalQuizzes,
    materiasExploradas: atualizado.materiasExploradas,
    ultimaPontuacao: atualizado.ultimaPontuacao,
    conquistas: atualizado.conquistas
  });

  return buscarPerfil(usuario.id);
};

const aplicarPremioLogin = (usuario = {}) => {
  return {
    ...usuario,
    ...calcularConquistasDoUsuario(usuario)
  };
};

module.exports = {
  buscarPerfil,
  atualizarPerfil,
  buscarConquistas,
  buscarPorEmail,
  listarUsuarios,
  criarUsuario,
  verificarCredenciais,
  atualizarXpUsuario,
  normalizarUsuario,
  calcularConquistasDoUsuario,
  aplicarPremioLogin
};
