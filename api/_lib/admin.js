/**
 * Firebase Admin (server side). Reads the service account from the environment.
 * Never exposed to the browser.
 */
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

function serviceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (parsed && parsed.private_key && parsed.client_email) {
        return {
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
          privateKey: String(parsed.private_key).replace(/\\n/g, '\n')
        };
      }
    } catch (e) { console.warn('FIREBASE_SERVICE_ACCOUNT is not valid JSON'); }
  }
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: String(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n')
    };
  }
  return null;
}

function getDb() {
  if (!getApps().length) {
    const account = serviceAccount();
    if (!account) {
      throw new Error('Firebase server credentials missing: set FIREBASE_SERVICE_ACCOUNT, or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY');
    }
    initializeApp({ credential: cert(account) });
  }
  return getFirestore();
}

module.exports = { getDb, FieldValue };
