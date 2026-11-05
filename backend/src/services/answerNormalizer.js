const getCorrectValue = (question = {}) =>
  question.respostaCorreta ?? question.resposta_correta ?? question.correctAnswer ?? question.correct_answer;

const isCorrectAnswer = (question = {}, submittedAnswer) => {
  const raw = getCorrectValue(question);
  if (raw === undefined || raw === null) return false;
  const alternatives = Array.isArray(question.alternativas) ? question.alternativas : [];
  const selected = String(submittedAnswer ?? '').trim();
  const correct = String(raw).trim();
  if (selected === correct) return true;
  const selectedIndex = /^\d+$/.test(selected) ? Number(selected) : -1;
  if (selectedIndex >= 0 && alternatives[selectedIndex] !== undefined && String(alternatives[selectedIndex]).trim() === correct) return true;
  const letterIndex = /^[A-E]$/i.test(correct) ? correct.toUpperCase().charCodeAt(0) - 65 : -1;
  if (letterIndex >= 0 && selectedIndex === letterIndex) return true;
  const numericCorrect = /^\d+$/.test(correct) ? Number(correct) : -1;
  if (numericCorrect >= 0 && selectedIndex === numericCorrect) return true;
  if (selectedIndex >= 0 && alternatives[selectedIndex] !== undefined && String(alternatives[selectedIndex]).trim() === correct) return true;
  if (numericCorrect >= 0 && alternatives[numericCorrect] !== undefined && String(alternatives[numericCorrect]).trim() === selected) return true;
  if (letterIndex >= 0 && alternatives[letterIndex] !== undefined && String(alternatives[letterIndex]).trim() === selected) return true;
  return false;
};
module.exports = { getCorrectValue, isCorrectAnswer };
