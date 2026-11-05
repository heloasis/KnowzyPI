const readJson = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
const currentUser = readJson('currentUser');
const profileName = document.getElementById('profileName');
const profileTag = document.getElementById('profileTag');
const profileXp = document.getElementById('profileXp');
const profileLevel = document.getElementById('profileLevel');
const profileWins = document.getElementById('profileWins');
const profileMascot = document.getElementById('profileMascot');
const profileStyle = document.getElementById('profileStyle');
const profileAccessory = document.getElementById('profileAccessory');
const profileMood = document.getElementById('profileMood');
const profileAvatar = document.getElementById('profileAvatar');
const backButton = document.getElementById('backToConquistas');
const setText = (element, value, fallback = 'Não disponível') => { if (element) element.textContent = value || fallback; };
const levelForXp = (xp) => xp >= 3000 ? 'Lenda' : xp >= 1500 ? 'Mestre' : xp >= 1000 ? 'Sábio' : xp >= 500 ? 'Aventureiro' : 'Iniciante';

(async () => {
  if (!currentUser?.id) { setText(profileName, 'Faça login para ver seu perfil'); return; }
  let profile = readJson(`profileData:${currentUser.id}`) || currentUser;
  try {
    const response = await fetch(`/users/${encodeURIComponent(currentUser.id)}`, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    if (response.ok) profile = await response.json();
  } catch (error) { console.warn('Perfil offline; exibindo os dados locais disponíveis.', error); }
  const xp = Number(profile.xp ?? profile.perfil?.xpTotal ?? profile.xpTotal ?? currentUser.xp ?? 0);
  const nome = profile.nome || currentUser.nome || '';
  setText(profileName, nome);
  setText(profileTag, profile.tag || profile.perfil?.tag || '');
  setText(profileXp, `${xp} XP`);
  setText(profileLevel, profile.perfil?.nivelAtual || levelForXp(xp));
  const achievements = Array.isArray(profile.conquistas) ? profile.conquistas.length : 0;
  setText(profileWins, String(achievements));
  setText(profileMascot, profile.mascote?.nome || profile.mascote?.expressao || '');
  setText(profileStyle, profile.mascote?.roupa || profile.style || '');
  setText(profileAccessory, profile.mascote?.acessorio || profile.accessory || '');
  setText(profileMood, profile.mascote?.expressao || profile.mood || '');
  setText(profileAvatar, nome ? nome.charAt(0).toUpperCase() : '');
})();
backButton?.addEventListener('click', () => { window.location.href = '/conquistas'; });
