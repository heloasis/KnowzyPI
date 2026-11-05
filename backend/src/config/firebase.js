// Firebase opcional no ambiente de desenvolvimento/preview.
// Quando as credenciais estiverem presentes, utiliza o projeto original indicado por FIREBASE_DATABASE_URL.
let db = null;
let firebaseAdmin = null;
let firebaseReady = false;
let firebaseError = null;

try {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    const adminApp = require('firebase-admin/app');
    const { getDatabase } = require('firebase-admin/database');
    const account = JSON.parse(raw);
    if (!account.project_id || !account.private_key || !account.client_email) {
      throw new Error('Credenciais incompletas em FIREBASE_SERVICE_ACCOUNT.');
    }
    const app = adminApp.getApps().length
      ? adminApp.getApp()
      : adminApp.initializeApp({
          credential: adminApp.cert({ ...account, private_key: account.private_key.replace(/\\n/g, '\n') }),
          databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://knowzypi-default-rtdb.firebaseio.com'
        });
    db = getDatabase(app);
    firebaseAdmin = require('firebase-admin');
    firebaseReady = true;
  }
} catch (error) {
  firebaseError = error;
  console.warn('[Firebase] Integração não inicializada:', error.message);
}

const unavailable = () => Promise.reject(new Error(
  'Firebase indisponível neste ambiente. Configure FIREBASE_SERVICE_ACCOUNT e FIREBASE_DATABASE_URL para habilitar a sincronização.'
));

// Mantém a interface db.ref(...) esperada pelos models, sem fingir que houve gravação.
if (!db) {
  db = {
    ref() {
      return {
        once: unavailable,
        set: unavailable,
        update: unavailable,
        remove: unavailable,
        transaction: unavailable,
        push() { return { key: `local-${Date.now()}`, set: unavailable }; }
      };
    }
  };
}

module.exports = { db, firebaseAdmin, isRealFirebase: firebaseReady, firebaseError };
