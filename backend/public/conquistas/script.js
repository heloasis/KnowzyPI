const DEFAULT_CATALOG = {
  primeiro_login: {
    titulo: 'Primeiro Login',
    descricao: 'Acesse o sistema pela primeira vez.',
    meta: 1,
    xpRecompensa: 25,
    icone: '🚀'
  },
  cinco_quizzes: {
    titulo: 'Cinco Quizzes',
    descricao: 'Responda 5 quizzes com sucesso.',
    meta: 5,
    xpRecompensa: 100,
    icone: '🎯'
  },
  explorar_materias: {
    titulo: 'Explorador',
    descricao: 'Explore pelo menos 5 matérias.',
    meta: 5,
    xpRecompensa: 200,
    icone: '🧭'
  },
  cinquenta_quizzes: {
    titulo: 'Mestre dos Quizzes',
    descricao: 'Complete 50 quizzes.',
    meta: 50,
    xpRecompensa: 500,
    icone: '🏆'
  },
  licao_perfeita: {
    titulo: 'Lição Perfeita',
    descricao: 'Alcance 100 pontos em uma lição.',
    meta: 1,
    xpRecompensa: 50,
    icone: '✨'
  }
};

const FALLBACK_PROFILE = {
  nome: 'Usuário',
  tag: '#0000',
  xpTotal: 0,
  id: null
};

const FALLBACK_MASCOTE = {
  roupa: 'casaco_roto',
  acessorio: 'fone_ouvido',
  expressao: 'piscada',
  efeito: 'galaxia',
  cor: 'roxo'
};

const readStoredUser = () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.id) {
      return currentUser;
    }
  } catch (error) {
    // Ignora falhas de parsing do storage.
  }

  try {
    const saved = JSON.parse(localStorage.getItem('profileData') || 'null');
    const currentUserId = localStorage.getItem('currentUserId');
    if (saved && saved.id && (!currentUserId || String(saved.id) === String(currentUserId))) {
      return saved;
    }
  } catch (error) {
    // Ignora falhas de parsing do storage.
  }

  return null;
};

const getCurrentUserId = () => {
  const user = readStoredUser();
  if (user && user.id) {
    return String(user.id);
  }

  const storedId = localStorage.getItem('currentUserId');
  return storedId ? String(storedId) : null;
};

const USER_ID = getCurrentUserId();

const userNameEl = document.getElementById('userName');
const userTagEl = document.getElementById('userTag');
const xpTotalEl = document.getElementById('xpTotal');
const levelNameEl = document.getElementById('levelName');
const nextLevelNameEl = document.getElementById('nextLevelName');
const xpRangeEl = document.getElementById('xpRange');
const nextLevelTextEl = document.getElementById('nextLevelText');
const questsListEl = document.getElementById('questsList');
const counterTextEl = document.getElementById('counterText');
const mascotVisualEl = document.getElementById('mascotVisual');
const backButton = document.getElementById('backButton');
const profileTrigger = document.getElementById('profileTrigger');

const petStages = [
  { key: 'iniciante', name: 'Iniciante', file: 'iniciante.png', min: 0, max: 499, next: 'Aventureiro' },
  { key: 'aventureiro', name: 'Aventureiro', file: 'aventureiro.png', min: 500, max: 999, next: 'Sábio' },
  { key: 'sabio', name: 'Sábio', file: 'sábio.png', min: 1000, max: 1499, next: 'Mestre' },
  { key: 'mestre', name: 'Mestre', file: 'mestre.png', min: 1500, max: 2999, next: 'Lenda' },
  { key: 'lenda', name: 'Lenda', file: 'lenda.png', min: 3000, max: Number.POSITIVE_INFINITY, next: 'Máximo' }
];

const resolvePetStage = (xp = 0) => {
  const safeXp = Number(xp) || 0;
  return petStages.find((stage) => safeXp >= stage.min && safeXp <= stage.max) || petStages[0];
};

const getLevelInfo = (xp) => {
  const stage = resolvePetStage(xp);
  const range = stage.max === Number.POSITIVE_INFINITY
    ? `${stage.min.toLocaleString('pt-BR')} XP+`
    : `${stage.min.toLocaleString('pt-BR')} - ${stage.max.toLocaleString('pt-BR')} XP`;

  return {
    name: stage.name,
    range,
    next: stage.next,
    file: stage.file
  };
};

const getPetImagePath = (fileName) => {
  const safeName = String(fileName || '').trim();
  return safeName ? `/imagens/${safeName}` : '/imagens/iniciante.png';
};

const setMascot = (mascote, xp = 0) => {
  const pet = resolvePetStage(xp);
  mascotVisualEl.innerHTML = `<img src="${getPetImagePath(pet.file)}" alt="${pet.name}" class="pet-image" />`;
};

const persistProfileData = (perfil = {}, mascote = {}) => {
  const xp = Number(perfil.xpTotal ?? perfil.xp ?? 0);
  const level = getLevelInfo(xp);

  const nextData = {
    id: perfil.id || getCurrentUserId(),
    nome: perfil.nome || FALLBACK_PROFILE.nome,
    tag: perfil.tag || FALLBACK_PROFILE.tag,
    xpTotal: xp,
    nivel: level.name,
    conquistas: `${counterTextEl.textContent || '0 / 0'}`,
    mascote: level.name,
    style: mascote?.roupa || FALLBACK_MASCOTE.roupa,
    accessory: mascote?.acessorio || FALLBACK_MASCOTE.acessorio,
    mood: mascote?.expressao || FALLBACK_MASCOTE.expressao
  };

  try {
    localStorage.setItem('profileData', JSON.stringify(nextData));
  } catch (error) {
    // Ignora falhas de storage em navegadores restritivos.
  }
};

const normalizeQuest = (quest = {}) => ({
  titulo: quest.titulo || 'Conquista',
  descricao: quest.descricao || 'Continue avançando para desbloquear esta conquista.',
  meta: Number.isFinite(Number(quest.meta)) ? Number(quest.meta) : 1,
  xpRecompensa: Number.isFinite(Number(quest.xpRecompensa)) ? Number(quest.xpRecompensa) : 0,
  icone: typeof quest.icone === 'string' && quest.icone.trim() ? quest.icone : '🏅'
});

const renderQuestIcon = (icon) => {
  const value = String(icon || '').trim();

  if (!value) return '<i class="fa-solid fa-star"></i>';
  if (/^[\p{Extended_Pictographic}\p{Emoji_Presentation}]$/u.test(value) || /[\u{1F300}-\u{1FAFF}]/u.test(value)) {
    return value;
  }
  if (value.includes('<i') || value.includes('fa-')) {
    return value.includes('<i') ? value : `<i class="${value}"></i>`;
  }

  return `<i class="fa-solid ${value}"></i>`;
};

const toProgressMap = (ids = []) => {
  const unlocked = new Set(
    Array.isArray(ids)
      ? ids.filter(Boolean).map((item) => String(item).trim())
      : []
  );

  return Object.entries(DEFAULT_CATALOG).reduce((accumulator, [id, quest]) => {
    accumulator[id] = {
      progressoAtual: unlocked.has(id) ? Number(quest.meta || 1) : 0,
      concluida: unlocked.has(id)
    };

    return accumulator;
  }, {});
};

const renderQuests = (catalog, progressMap) => {
  const entries = Object.entries(catalog || DEFAULT_CATALOG);
  const completedCount = entries.filter(([id]) => Boolean(progressMap?.[id]?.concluida)).length;
  const total = entries.length;

  counterTextEl.textContent = `${completedCount} / ${total}`;

  questsListEl.innerHTML = entries.map(([id, rawQuest]) => {
    const quest = normalizeQuest(rawQuest);
    const userQuest = progressMap?.[id] || { progressoAtual: 0, concluida: false };
    const progressValue = Number(userQuest.progressoAtual || 0);
    const safeMeta = Math.max(1, Number(quest.meta || 1));
    const progress = Math.min(progressValue, safeMeta);
    const percent = Math.min(100, (progress / safeMeta) * 100);
    const isComplete = Boolean(userQuest.concluida);
    const isInProgress = !isComplete && progress > 0;
    const actionLabel = isComplete ? 'Concluída' : isInProgress ? 'Continuar' : 'Bloqueado';
    const actionClass = isComplete ? 'completed' : isInProgress ? 'in-progress' : 'locked';
    const buttonIcon = isComplete ? '✓' : isInProgress ? '→' : '🔒';
    const progressText = isComplete ? `${safeMeta}/${safeMeta}` : `${progress}/${safeMeta}`;

    return `
      <article class="quest-card">
        <div class="quest-icon" aria-hidden="true">${renderQuestIcon(quest.icone)}</div>

        <div class="quest-info">
          <div class="quest-title-row">
            <h4>${quest.titulo}</h4>
            <span class="quest-reward">+${quest.xpRecompensa} XP</span>
          </div>
          <p>${quest.descricao}</p>

          <div class="progress-track" aria-label="Progresso da conquista">
            <span class="progress-bar" style="width: ${percent}%"></span>
          </div>

          <div class="progress-meta">
            <span>${progressText}</span>
            <span>${Math.round(percent)}%</span>
          </div>
        </div>

        <button class="quest-action ${actionClass}" type="button" aria-label="${actionLabel}">
          ${buttonIcon} ${actionLabel}
        </button>
      </article>
    `;
  }).join('');
};

const renderProfile = ({ perfil = {}, mascote = {}, conquistas = [], catalog = DEFAULT_CATALOG }) => {
  const safePerfil = {
    ...FALLBACK_PROFILE,
    ...perfil,
    nome: perfil.nome || FALLBACK_PROFILE.nome,
    tag: perfil.tag || FALLBACK_PROFILE.tag,
    xpTotal: Number(perfil.xpTotal ?? perfil.xp ?? 0)
  };

  const xp = Number(safePerfil.xpTotal || 0);
  const level = getLevelInfo(xp);
  const nextLevel = level.next;

  userNameEl.textContent = safePerfil.nome || FALLBACK_PROFILE.nome;
  userTagEl.textContent = safePerfil.tag || FALLBACK_PROFILE.tag;
  xpTotalEl.textContent = `${xp} XP`;
  levelNameEl.textContent = level.name;
  nextLevelNameEl.textContent = nextLevel === 'Máximo' ? 'Nível máximo' : nextLevel;
  xpRangeEl.textContent = level.range;
  nextLevelTextEl.textContent = nextLevel === 'Máximo' ? 'Nível máximo alcançado' : `Próximo nível: ${nextLevel}`;

  setMascot(mascote || FALLBACK_MASCOTE, xp);
  renderQuests(catalog, toProgressMap(conquistas || []));
  persistProfileData(safePerfil, mascote || FALLBACK_MASCOTE);
};

const loadUserAchievements = async () => {
  const id = getCurrentUserId();
  const storedUser = readStoredUser() || {};

  if (!id) {
    renderProfile({
      perfil: {
        ...FALLBACK_PROFILE,
        id: null,
        xpTotal: 0
      },
      mascote: FALLBACK_MASCOTE,
      conquistas: [],
      catalog: DEFAULT_CATALOG
    });
    return;
  }

  try {
    const perfilResponse = await fetch(`/users/${encodeURIComponent(id)}`, {
      credentials: 'same-origin'
    });

    const conquistasResponse = await fetch(`/users/${encodeURIComponent(id)}/conquistas`, {
      credentials: 'same-origin'
    });

    if (!perfilResponse.ok && !conquistasResponse.ok) {
      throw new Error('Usuário sem dados reais no backend.');
    }

    const perfilData = perfilResponse.ok ? await perfilResponse.json() : null;
    const conquistasData = conquistasResponse.ok ? await conquistasResponse.json() : [];

    const perfil = {
      ...FALLBACK_PROFILE,
      ...storedUser,
      ...perfilData,
      id,
      nome: perfilData?.nome || storedUser?.nome || 'Usuário',
      tag: perfilData?.tag || storedUser?.tag || FALLBACK_PROFILE.tag,
      xpTotal: Number(perfilData?.xp ?? perfilData?.perfil?.xpTotal ?? storedUser?.xp ?? 0)
    };

    renderProfile({
      perfil,
      mascote: perfilData?.mascote || FALLBACK_MASCOTE,
      conquistas: Array.isArray(conquistasData) ? conquistasData : [],
      catalog: DEFAULT_CATALOG
    });
  } catch (error) {
    console.warn('Falha ao carregar conquistas do usuário; exibindo estado zerado.', error);
    renderProfile({
      perfil: {
        ...FALLBACK_PROFILE,
        id,
        xpTotal: 0
      },
      mascote: FALLBACK_MASCOTE,
      conquistas: [],
      catalog: DEFAULT_CATALOG
    });
  }
};

const openProfilePage = () => {
  window.location.href = '/perfil';
};

profileTrigger?.addEventListener('click', openProfilePage);
backButton?.addEventListener('click', () => {
  window.history.back();
});

loadUserAchievements();
