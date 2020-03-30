import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

import _logsEntry from './logsEntry';

export const logsEntry = functions.https.onCall(_logsEntry);
