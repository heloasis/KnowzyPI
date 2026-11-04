
const admin = require('firebase-admin');

const DATABASE_URL =
  process.env.FIREBASE_DATABASE_URL ||
  'https://knowzypi-default-rtdb.firebaseio.com';

const readServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed.project_id || !parsed.private_key || !parsed.client_email) {
      throw new Error('Credenciais incompletas do Firebase.');
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
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount = readServiceAccount();

  if (!serviceAccount) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT não configurada.'
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: DATABASE_URL
  });
};

const app = initializeFirebase();
const db = admin.database(app);

module.exports = {
  db,
  firebaseAdmin: admin,
  isRealFirebase: true
};
