const defaults = {
  nome: 'Aluno Teste',
  tag: '#A12',
  xpTotal: 780,
  nivel: 'Iniciante',
  conquistas: '1 / 5',
  mascote: '🐾',
  style: 'Manto Azul',
  accessory: 'Óculos',
  mood: 'Feliz'
};

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

const savedData = JSON.parse(localStorage.getItem('profileData') || 'null') || defaults;

profileName.textContent = savedData.nome || defaults.nome;
profileTag.textContent = savedData.tag || defaults.tag;
profileXp.textContent = `${savedData.xpTotal || defaults.xpTotal} XP`;
profileLevel.textContent = savedData.nivel || defaults.nivel;
profileWins.textContent = savedData.conquistas || defaults.conquistas;
profileMascot.textContent = savedData.mascote || defaults.mascote;
profileStyle.textContent = savedData.style || defaults.style;
profileAccessory.textContent = savedData.accessory || defaults.accessory;
profileMood.textContent = savedData.mood || defaults.mood;
profileAvatar.textContent = (savedData.nome || defaults.nome).charAt(0).toUpperCase();

backButton?.addEventListener('click', () => {
  window.location.href = '/conquistas';
});
