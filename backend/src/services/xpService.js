const levelForXp = (xp) => xp >= 3000 ? 'Lenda' : xp >= 1500 ? 'Mestre' : xp >= 1000 ? 'Sábio' : xp >= 500 ? 'Aventureiro' : 'Iniciante';
const uniqueStrings = (values) => [...new Set((Array.isArray(values) ? values : []).filter(Boolean).map(String))];

/** Regra pura e testável: 5 XP por pergunta correta, uma vez por usuário/matéria. */
const aplicarPontuacao = (usuario = {}, materiaId, questoesCorretas = [], quizKey, ultimaPontuacao) => {
  const questoesPontuadas = { ...(usuario.questoesPontuadas || {}) };
  const materiaPontuada = { ...(questoesPontuadas[materiaId] || {}) };
  let xpGanho = 0;
  for (const id of uniqueStrings(questoesCorretas)) {
    if (!materiaPontuada[id]) { materiaPontuada[id] = true; xpGanho += 5; }
  }
  questoesPontuadas[materiaId] = materiaPontuada;
  const quizzesConcluidos = { ...(usuario.quizzesConcluidos || {}) };
  const key = String(quizKey || `${materiaId}:${uniqueStrings(questoesCorretas).sort().join(',')}`);
  const quizNovo = !quizzesConcluidos[key];
  quizzesConcluidos[key] = true;
  const xp = Number(usuario.xp ?? usuario.perfil?.xpTotal ?? 0) + xpGanho;
  const materiasExploradas = uniqueStrings([...(usuario.materiasExploradas || []), materiaId]);
  const conquistas = uniqueStrings(usuario.conquistas || []);
  if (xp >= 25) conquistas.push('primeiro_login');
  if (materiasExploradas.length >= 5) conquistas.push('explorar_materias');
  const totalQuizzes = Number(usuario.totalQuizzes || 0) + (quizNovo ? 1 : 0);
  if (totalQuizzes >= 5) conquistas.push('cinco_quizzes');
  if (totalQuizzes >= 50) conquistas.push('cinquenta_quizzes');
  const score = Number(ultimaPontuacao ?? usuario.ultimaPontuacao ?? 0);
  if (score >= 100) conquistas.push('licao_perfeita');
  const normalizadas = uniqueStrings(conquistas);
  return {
    xpGanho,
    usuario: {
      ...usuario, xp, totalQuizzes, materiasExploradas, ultimaPontuacao: score,
      conquistas: normalizadas, questoesPontuadas, quizzesConcluidos,
      perfil: { ...(usuario.perfil || {}), xpTotal: xp, nivelAtual: levelForXp(xp) }
    }
  };
};
module.exports = { aplicarPontuacao, levelForXp };
