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

// Lê o usuário conectado.
const readStoredUser = () => {
  try {
    const currentUser = JSON.parse(
      localStorage.getItem('currentUser') || 'null'
    );

    if (currentUser && currentUser.id) {
      return currentUser;
    }
  } catch (error) {
    console.warn('Não foi possível ler currentUser.', error);
  }

  try {
    const currentUserId = localStorage.getItem('currentUserId');
    const saved = JSON.parse(
      localStorage.getItem(currentUserId ? `profileData:${currentUserId}` : 'profileData') || 'null'
    );

    if (
      saved &&
      saved.id &&
      (!currentUserId || String(saved.id) === String(currentUserId))
    ) {
      return saved;
    }
  } catch (error) {
    console.warn('Não foi possível ler profileData.', error);
  }

  return null;
};

// Lê o perfil salvo localmente, mesmo sem conexão com a API.
const readStoredProfile = () => {
  try {
    const currentUserId = getCurrentUserId() || localStorage.getItem('currentUserId');
    const saved = JSON.parse(
      localStorage.getItem(currentUserId ? `profileData:${currentUserId}` : 'profileData') || 'null'
    );

    if (!saved || typeof saved !== 'object') {
      return null;
    }

    // Evita utilizar o perfil de outra conta.
    if (
      saved.id &&
      currentUserId &&
      String(saved.id) !== String(currentUserId)
    ) {
      return null;
    }

    return saved;
  } catch (error) {
    console.warn('Não foi possível recuperar o perfil local.', error);
    return null;
  }
};

const getCurrentUserId = () => {
  const user = readStoredUser();

  if (user && user.id) {
    return String(user.id);
  }

  const storedId = localStorage.getItem('currentUserId');

  return storedId ? String(storedId) : null;
};

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
  {
    key: 'iniciante',
    name: 'Iniciante',
    file: 'iniciante.png',
    min: 0,
    max: 499,
    next: 'Aventureiro'
  },
  {
    key: 'aventureiro',
    name: 'Aventureiro',
    file: 'aventureiro.png',
    min: 500,
    max: 999,
    next: 'Sábio'
  },
  {
    key: 'sabio',
    name: 'Sábio',
    file: 'sábio.png',
    min: 1000,
    max: 1499,
    next: 'Mestre'
  },
  {
    key: 'mestre',
    name: 'Mestre',
    file: 'mestre.png',
    min: 1500,
    max: 2999,
    next: 'Lenda'
  },
  {
    key: 'lenda',
    name: 'Lenda',
    file: 'lenda.png',
    min: 3000,
    max: Number.POSITIVE_INFINITY,
    next: 'Máximo'
  }
];

const resolvePetStage = (xp = 0) => {
  const safeXp = Math.max(0, Number(xp) || 0);

  return petStages.find(
    (stage) => safeXp >= stage.min && safeXp <= stage.max
  ) || petStages[0];
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

  return safeName
    ? `/imagens/${safeName}`
    : '/imagens/iniciante.png';
};

const setMascot = (mascote, xp = 0) => {
  if (!mascotVisualEl) return;

  const pet = resolvePetStage(xp);

  mascotVisualEl.innerHTML = `
    <img
      src="${getPetImagePath(pet.file)}"
      alt="${pet.name}"
      class="pet-image"
    />
  `;
};

// Salva o perfil atualizado no navegador.
const persistProfileData = (perfil = {}, mascote = {}) => {
  const xp = Math.max(
    0,
    Number(perfil.xpTotal ?? perfil.xp ?? 0)
  );

  const level = getLevelInfo(xp);

  const nextData = {
    ...(readStoredProfile() || {}),
    id: perfil.id || getCurrentUserId(),
    nome: perfil.nome || FALLBACK_PROFILE.nome,
    tag: perfil.tag || FALLBACK_PROFILE.tag,
    xpTotal: xp,
    nivel: level.name,
    conquistas: counterTextEl?.textContent || '0 / 0',
    mascote: level.name,
    style: mascote?.roupa || FALLBACK_MASCOTE.roupa,
    accessory: mascote?.acessorio || FALLBACK_MASCOTE.acessorio,
    mood: mascote?.expressao || FALLBACK_MASCOTE.expressao
  };

  try {
    const userId = getCurrentUserId();
    localStorage.setItem(userId ? `profileData:${userId}` : 'profileData', JSON.stringify(nextData));
  } catch (error) {
    console.warn('Não foi possível salvar o perfil local.', error);
  }
};

const normalizeQuest = (quest = {}) => ({
  titulo: quest.titulo || 'Conquista',
  descricao:
    quest.descricao || 'Continue avançando para desbloquear esta conquista.',
  meta: Number.isFinite(Number(quest.meta))
    ? Number(quest.meta)
    : 1,
  xpRecompensa: Number.isFinite(Number(quest.xpRecompensa))
    ? Number(quest.xpRecompensa)
    : 0,
  icone:
    typeof quest.icone === 'string' && quest.icone.trim()
      ? quest.icone
      : '🏅'
});

const renderQuestIcon = (icon) => {
  const value = String(icon || '').trim();

  if (!value) {
    return '<i class="fa-solid fa-star"></i>';
  }

  if (
    /^[\p{Extended_Pictographic}\p{Emoji_Presentation}]$/u.test(value) ||
    /[\u{1F300}-\u{1FAFF}]/u.test(value)
  ) {
    return value;
  }

  if (value.includes('<i') || value.includes('fa-')) {
    return value.includes('<i')
      ? value
      : `<i class="${value}"></i>`;
  }

  return `<i class="fa-solid ${value}"></i>`;
};

const toProgressMap = (ids = []) => {
  const unlocked = new Set(
    Array.isArray(ids)
      ? ids.filter(Boolean).map((item) => String(item).trim())
      : []
  );

  return Object.entries(DEFAULT_CATALOG).reduce(
    (accumulator, [id, quest]) => {
      accumulator[id] = {
        progressoAtual: unlocked.has(id)
          ? Number(quest.meta || 1)
          : 0,
        concluida: unlocked.has(id)
      };

      return accumulator;
    },
    {}
  );
};

const renderQuests = (catalog, progressMap) => {
  if (!questsListEl) return;

  const entries = Object.entries(catalog || DEFAULT_CATALOG);

  const completedCount = entries.filter(
    ([id]) => Boolean(progressMap?.[id]?.concluida)
  ).length;

  const total = entries.length;

  if (counterTextEl) {
    counterTextEl.textContent = `${completedCount} / ${total}`;
  }

  questsListEl.innerHTML = entries.map(([id, rawQuest]) => {
    const quest = normalizeQuest(rawQuest);

    const userQuest = progressMap?.[id] || {
      progressoAtual: 0,
      concluida: false
    };

    const progressValue = Number(userQuest.progressoAtual || 0);
    const safeMeta = Math.max(1, Number(quest.meta || 1));
    const progress = Math.min(progressValue, safeMeta);
    const percent = Math.min(100, (progress / safeMeta) * 100);

    const isComplete = Boolean(userQuest.concluida);
    const isInProgress = !isComplete && progress > 0;

    const actionLabel = isComplete
      ? 'Concluída'
      : isInProgress
        ? 'Continuar'
        : 'Bloqueado';

    const actionClass = isComplete
      ? 'completed'
      : isInProgress
        ? 'in-progress'
        : 'locked';

    const buttonIcon = isComplete
      ? '✓'
      : isInProgress
        ? '→'
        : '🔒';

    const progressText = isComplete
      ? `${safeMeta}/${safeMeta}`
      : `${progress}/${safeMeta}`;

    return `
      <article class="quest-card">
        <div class="quest-icon" aria-hidden="true">
          ${renderQuestIcon(quest.icone)}
        </div>

        <div class="quest-info">
          <div class="quest-title-row">
            <h4>${quest.titulo}</h4>
            <span class="quest-reward">
              +${quest.xpRecompensa} XP
            </span>
          </div>

          <p>${quest.descricao}</p>

          <div class="progress-track" aria-label="Progresso da conquista">
            <span
              class="progress-bar"
              style="width: ${percent}%"
            ></span>
          </div>

          <div class="progress-meta">
            <span>${progressText}</span>
            <span>${Math.round(percent)}%</span>
          </div>
        </div>

        <button
          class="quest-action ${actionClass}"
          type="button"
          aria-label="${actionLabel}"
        >
          ${buttonIcon} ${actionLabel}
        </button>
      </article>
    `;
  }).join('');
};

const renderProfile = ({
  perfil = {},
  mascote = {},
  conquistas = [],
  catalog = DEFAULT_CATALOG
}) => {
  const safePerfil = {
    ...FALLBACK_PROFILE,
    ...perfil,
    nome: perfil.nome || FALLBACK_PROFILE.nome,
    tag: perfil.tag || FALLBACK_PROFILE.tag,
    xpTotal: Math.max(
      0,
      Number(perfil.xpTotal ?? perfil.xp ?? 0)
    )
  };

  const xp = safePerfil.xpTotal;
  const level = getLevelInfo(xp);
  const nextLevel = level.next;

  if (userNameEl) {
    userNameEl.textContent = safePerfil.nome;
  }

  if (userTagEl) {
    userTagEl.textContent = safePerfil.tag;
  }

  if (xpTotalEl) {
    xpTotalEl.textContent = `${xp} XP`;
  }

  if (levelNameEl) {
    levelNameEl.textContent = level.name;
  }

  if (nextLevelNameEl) {
    nextLevelNameEl.textContent =
      nextLevel === 'Máximo'
        ? 'Nível máximo'
        : nextLevel;
  }

  if (xpRangeEl) {
    xpRangeEl.textContent = level.range;
  }

  if (nextLevelTextEl) {
    nextLevelTextEl.textContent =
      nextLevel === 'Máximo'
        ? 'Nível máximo alcançado'
        : `Próximo nível: ${nextLevel}`;
  }

  setMascot(mascote || FALLBACK_MASCOTE, xp);

  renderQuests(
    catalog,
    toProgressMap(conquistas || [])
  );

  persistProfileData(
    safePerfil,
    mascote || FALLBACK_MASCOTE
  );
};

// Carrega primeiro o perfil local para a tela nunca começar zerada.
const loadUserAchievements = async () => {
  const id = getCurrentUserId();
  const storedUser = readStoredUser() || {};
  const storedProfile = readStoredProfile() || {};

  const localXp = Math.max(
    0,
    Number(
      storedProfile.xpTotal ??
      storedProfile.xp ??
      storedUser.xpTotal ??
      storedUser.xp ??
      0
    )
  );

  const localProfile = {
    ...FALLBACK_PROFILE,
    ...storedUser,
    ...storedProfile,
    id: id || storedProfile.id || null,
    nome:
      storedProfile.nome ||
      storedUser.nome ||
      FALLBACK_PROFILE.nome,
    tag:
      storedProfile.tag ||
      storedUser.tag ||
      FALLBACK_PROFILE.tag,
    xpTotal: localXp
  };

  const localMascote = {
    ...FALLBACK_MASCOTE,
    ...(storedProfile.mascote && typeof storedProfile.mascote === 'object'
      ? storedProfile.mascote
      : {})
  };

  const localConquistas = Array.isArray(storedProfile.conquistas)
    ? storedProfile.conquistas
    : [];

  // Exibe os dados locais imediatamente.
  renderProfile({
    perfil: localProfile,
    mascote: localMascote,
    conquistas: localConquistas,
    catalog: DEFAULT_CATALOG
  });

  // Sem usuário conectado, mantém o perfil local.
  if (!id) {
    return;
  }

  try {
    const [perfilResponse, conquistasResponse] = await Promise.all([
      fetch(`/users/${encodeURIComponent(id)}`, {
        credentials: 'same-origin'
      }),
      fetch(`/users/${encodeURIComponent(id)}/conquistas`, {
        credentials: 'same-origin'
      })
    ]);

    if (!perfilResponse.ok && !conquistasResponse.ok) {
      throw new Error('Não foi possível carregar os dados do usuário.');
    }

    const perfilData = perfilResponse.ok
      ? await perfilResponse.json()
      : null;

    const conquistasData = conquistasResponse.ok
      ? await conquistasResponse.json()
      : null;

    const perfilServidor = perfilData?.usuario || perfilData || {};

    const xpServidor = Number(
      perfilServidor.xp ??
      perfilServidor.perfil?.xpTotal ??
      perfilServidor.xpTotal ??
      0
    );

    // Mantém o maior valor enquanto a sincronização local ainda
    // não estiver implementada, evitando esconder XP já exibido
    // no navegador.
    const xpFinal = Math.max(
      localXp,
      Number.isFinite(xpServidor) ? xpServidor : 0
    );

    const perfilAtualizado = {
      ...localProfile,
      ...perfilServidor,
      id,
      nome:
        perfilServidor.nome ||
        perfilServidor.perfil?.nome ||
        localProfile.nome,
      tag:
        perfilServidor.tag ||
        localProfile.tag,
      xpTotal: xpFinal
    };

    const conquistasFinais = Array.isArray(conquistasData)
      ? conquistasData
      : localConquistas;

    renderProfile({
      perfil: perfilAtualizado,
      mascote: perfilServidor.mascote || localMascote,
      conquistas: conquistasFinais,
      catalog: DEFAULT_CATALOG
    });

  } catch (error) {
    console.warn(
      'Não foi possível sincronizar com a API. Mantendo os dados locais.',
      error
    );

    // Não zera o XP se a API estiver indisponível.
    renderProfile({
      perfil: localProfile,
      mascote: localMascote,
      conquistas: localConquistas,
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
