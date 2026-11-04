
const {
  initializeApp,
  getApps,
  getApp,
  cert
} = require('firebase-admin/app');

const {
  getDatabase
} = require('firebase-admin/database');

const DATABASE_URL =
  process.env.FIREBASE_DATABASE_URL ||
  'https://knowzypi-default-rtdb.firebaseio.com';

const readServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT não configurada.'
    );
  }

  try {
    const parsed = JSON.parse(raw);

    if (
      !parsed.project_id ||
      !parsed.private_key ||
      !parsed.client_email
    ) {
      throw new Error(
        'Credenciais incompletas do Firebase.'
      );
    }

    return {
      ...parsed,
      private_key: parsed.private_key.replace(/\\n/g, '\n')
    };
  } catch (error) {
    throw new Error(
      `FIREBASE_SERVICE_ACCOUNT inválida: ${error.message}`
    );
  }
};

const initializeFirebase = () => {
  if (getApps().length > 0) {
    return getApp();
  }

  const serviceAccount = readServiceAccount();

  return initializeApp({
    credential: cert(serviceAccount),
    databaseURL: DATABASE_URL
  });
};

const app = initializeFirebase();

const db = getDatabase(app);

const firebaseAdmin = require('firebase-admin');

module.exports = {
  db,
  firebaseAdmin,
  isRealFirebase: true
};
