import * as admin from 'firebase-admin';
import * as funcs from 'firebase-functions';

//db refs
const _db = admin.firestore();
const users = _db.collection('users');
const alerts = (uid) => users.doc(uid).collection('alerts');
const locationLogs = (uid) => users.doc(uid).collection('locationLogs');
const affectedUsers = (uid) => users.doc(uid).collection('affectedUsers');
const global_constants = _db.collection('config').doc('global_constants');
const userTasks = (uid) => users.doc(uid).collection('tasks');

//exports
export const db = {
  users,
  alerts,
  locationLogs,
  affectedUsers,
  global_constants,
  userTasks,
};

export const firebase = admin;
export const functions = funcs;
