import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getDatabase, ref, get, onValue } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDemoKnowzyPI',
  authDomain: 'knowzypi-default-rtdb.firebaseapp.com',
  databaseURL: 'https://knowzypi-default-rtdb.firebaseio.com',
  projectId: 'knowzypi-default-rtdb',
  storageBucket: 'knowzypi-default-rtdb.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:demo-knowledge-platform'
};

const USER_ID = 'ID_USUARIO_EXEMPLO';
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const fallbackPerfil = {
  nome: 'Aluno Teste',
  tag: '#A12',
  xpTotal: 780
};

const fallbackConquistas = {
  quest1: {
    titulo: 'Primeiros Passos',
    descricao: 'Faça seu primeiro login ou acesse a plataforma.',
    meta: 1,
    xpRecompensa: 50,
    icone: '🚀'
  },
  quest2: {
    titulo: 'Mestre dos Quiz',
    descricao: 'Complete 50 quizzes.',
    meta: 50,
    xpRecompensa: 500,
    icone: '🏆'
  },
  quest3: {
    titulo: 'Explorador das Matérias',
    descricao: 'Explore todas as matérias.',
    meta: 5,
    xpRecompensa: 200,
    icone: '🧭'
  },
  quest4: {
    titulo: 'Foco Total',
    descricao: 'Complete 5 quizzes.',
    meta: 5,
    xpRecompensa: 100,
    icone: '🎯'
  },
  quest5: {
    titulo: 'Lição Perfeita',
    descricao: 'Faça uma lição perfeita.',
    meta: 1,
    xpRecompensa: 50,
    icone: '✨'
  }
};

const fallbackUserProgress = {
  quest1: { progressoAtual: 1, concluida: true },
  quest2: { progressoAtual: 23, concluida: false },
  quest3: { progressoAtual: 5, concluida: true },
  quest4: { progressoAtual: 3, concluida: false },
  quest5: { progressoAtual: 1, concluida: false }
};

const fallbackMascote = {
  roupa: 'Manto Azul',
  acessorio: 'Óculos',
  expressao: 'Feliz',
  efeito: 'Brilho',
  cor: 'Roxo'
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

const getLevelInfo = (xp) => {
  if (xp >= 3000) return { name: 'Lenda', range: '3.000 XP+', next: 'Máximo' };
  if (xp >= 1500) return { name: 'Mestre', range: '1.500 - 2.999 XP', next: 'Lenda' };
  if (xp >= 1000) return { name: 'Sábio', range: '1.000 - 1.499 XP', next: 'Mestre' };
  if (xp >= 500) return { name: 'Aventureiro', range: '500 - 999 XP', next: 'Sábio' };
  return { name: 'Iniciante', range: '0 - 499 XP', next: 'Aventureiro' };
};

const resolveMascotEmoji = (mascote = {}) => {
  const key = (mascote.roupa || '').toLowerCase();
  if (key.includes('manto') || key.includes('roxo')) return '🦊';
  if (key.includes('azul')) return '🐼';
  if (key.includes('verde')) return '🦄';
  return '🐾';
};

const setMascot = (mascote) => {
  mascotVisualEl.textContent = resolveMascotEmoji(mascote);
};

const persistProfileData = (perfil = {}, mascote = {}) => {
  const nextData = {
    nome: perfil.nome || fallbackPerfil.nome,
    tag: perfil.tag || fallbackPerfil.tag,
    xpTotal: Number(perfil.xpTotal || fallbackPerfil.xpTotal),
    nivel: getLevelInfo(Number(perfil.xpTotal || fallbackPerfil.xpTotal)).name,
    conquistas: `${counterTextEl.textContent || '0 / 0'}`,
    mascote: resolveMascotEmoji(mascote),
    style: mascote?.roupa || 'Manto Azul',
    accessory: mascote?.acessorio || 'Óculos',
    mood: mascote?.expressao || 'Feliz'
  };

  localStorage.setItem('profileData', JSON.stringify(nextData));
};

const normalizeQuest = (quest = {}) => ({
  titulo: quest.titulo || 'Conquista',
  descricao: quest.descricao || 'Continue avançando para desbloquear esta conquista.',
  meta: Number.isFinite(Number(quest.meta)) ? Number(quest.meta) : 1,
  xpRecompensa: Number.isFinite(Number(quest.xpRecompensa)) ? Number(quest.xpRecompensa) : 0,
  icone: typeof quest.icone === 'string' && quest.icone.trim() ? quest.icone : '🏅'
});

const renderQuests = (catalog, progressMap) => {
  const entries = Object.entries(catalog || {});
  const completedCount = entries.filter(([id]) => {
    const item = progressMap?.[id] || {};
    return Boolean(item.concluida);
  }).length;

  const total = entries.length;
  counterTextEl.textContent = `${completedCount} / ${total}`;

  questsListEl.innerHTML = entries.map(([id, rawQuest]) => {
    const quest = normalizeQuest(rawQuest);
    const userQuest = progressMap?.[id] || { progressoAtual: 0, concluida: false };
    const progressValue = Number(userQuest.progressoAtual || 0);
    const safeMeta = Math.max(1, quest.meta || 1);
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
        <div class="quest-icon" aria-hidden="true">${quest.icone}</div>

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

const renderProfile = ({ perfil = {}, mascote = {}, conquistas = {}, catalog = {} }) => {
  const xp = Number(perfil.xpTotal || 0);
  const level = getLevelInfo(xp);
  const nextLevel = level.next;

  userNameEl.textContent = perfil.nome || fallbackPerfil.nome;
  userTagEl.textContent = perfil.tag || fallbackPerfil.tag;
  xpTotalEl.textContent = `${xp} XP`;
  levelNameEl.textContent = level.name;
  nextLevelNameEl.textContent = nextLevel;
  xpRangeEl.textContent = `${level.range}`;
  nextLevelTextEl.textContent = `Próximo nível: ${nextLevel}`;

  setMascot(mascote);
  renderQuests(catalog, conquistas);
  persistProfileData(perfil, mascote);
};

const loadFromFirebase = async () => {
  try {
    const perfilSnap = await get(ref(db, `usuarios/${USER_ID}/perfil`));
    const conquistasSnap = await get(ref(db, `usuarios/${USER_ID}/conquistas`));
    const mascoteSnap = await get(ref(db, `usuarios/${USER_ID}/mascote`));
    const catalogSnap = await get(ref(db, 'conquistas_disponiveis'));

    const perfil = perfilSnap.exists() ? perfilSnap.val() : fallbackPerfil;
    const catalog = catalogSnap.exists() ? catalogSnap.val() : fallbackConquistas;
    const conquistas = conquistasSnap.exists() ? conquistasSnap.val() : fallbackUserProgress;
    const mascote = mascoteSnap.exists() ? mascoteSnap.val() : fallbackMascote;

    renderProfile({ perfil, mascote, conquistas, catalog });

    onValue(ref(db, `usuarios/${USER_ID}/perfil`), (snapshot) => {
      const data = snapshot.val() || fallbackPerfil;
      if (data) {
        renderProfile({ perfil: data, mascote: mascoteSnap.val() || fallbackMascote, conquistas: conquistasSnap.val() || fallbackUserProgress, catalog: catalogSnap.val() || fallbackConquistas });
      }
    });
  } catch (error) {
    console.warn('Falha ao carregar Firebase, usando dados de fallback.', error);
    renderProfile({
      perfil: fallbackPerfil,
      mascote: fallbackMascote,
      conquistas: fallbackUserProgress,
      catalog: fallbackConquistas
    });
  }
};

const openProfilePage = () => {
  window.location.href = '/perfil';
};

profileTrigger?.addEventListener('click', openProfilePage);

backButton.addEventListener('click', () => {
  window.history.back();
});

loadFromFirebase();
