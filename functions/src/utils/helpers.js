import Geo from './geolocation';
import {
  random_number,
  random_int,
  snapMillisToTrailing,
  hoursToMillis,
} from './utils';
import {db, functions} from './firebase';
import {logsToHasMap} from '../aggregateHashMap';
import Firestore from '../firestore';

export const generateRandLogs = ({
  cLat,
  cLng,
  radius,
  minAlt,
  maxAlt,
  hours,
  intervalSecs,
  startTime = Date.now(),
}) => {
  const [minLat, minLng, maxLat, maxLng] = Geo.get_circle_box(
    cLat,
    cLng,
    radius,
  );

  let logs = [];
  const minTime = startTime - hours * 60 * 60 * 1000;
  for (let i = 0; i < hours * 3600; i += intervalSecs)
    logs.push({
      lat: random_number(minLat, maxLat),
      lng: random_number(minLng, maxLng),
      alt: random_number(minAlt, maxAlt),
      timestamp: minTime + i * 1000,
    });

  return logs;
};

const generateRandLogDocs = ({cLat, cLng, meters, days, intervalSecs}) => {
  const [minLat, minLng, maxLat, maxLng] = Geo.get_circle_box(
    cLat,
    cLng,
    meters,
  );

  const logDocs = [];
  for (let hour = 0; hour < days * 24; hour++) {
    const logs = [];
    const minTime = Date.now() - (days * 24 - hour) * 60 * 60 * 1000;
    const maxTime = minTime + 60 * 60 * 1000;

    for (let i = 0; i < 3600; i += intervalSecs) {
      logs.push({
        lat: random_number(minLat, maxLat),
        lng: minLng, // random_number(minLng, maxLng),
        timestamp: random_int(minTime, maxTime),
      });
    }
    logDocs.push({
      id: minTime,
      hour: minTime,
      logs,
      timeRange: {
        min: new Date(minTime),
        max: new Date(maxTime),
      },
    });
  }
  return logDocs;
};

const calculateMeanHoursArray = (hashMap) => {
  let sum = 0;
  for (let hash in hashMap) {
    sum += hashMap[hash].length;
  }
  return sum / Object.keys(hashMap).length;
};

const test = ({
  cLat = 24.860734299999997,
  cLng = 67.0011364,
  testRadius = 80000,
  minAlt = -25,
  maxAlt = 25,
  testDays = 14,
  testIntervalSecs = 20,
  pointRadius = 5,
  hashPrecesion = 5,
  hashTimeSnapHours = 4,
  error = 10,
}) => {
  const logs = generateRandLogs({
    cLat,
    cLng,
    radius: testRadius,
    minAlt,
    maxAlt,
    hour: testDays * 24,
    intervalSecs: testIntervalSecs,
  });
  const hashMap = logsToHasMap({
    logs,
    nearDistanceThreshold: pointRadius,
    hashTimeSnapMillis: hoursToMillis(hashTimeSnapHours),
    precesion: hashPrecesion,
    error,
  });

  console.log('Hashes:', Object.keys(hashMap).length);
  console.log('Mean Hour Array Size:', calculateMeanHoursArray(hashMap));
};

///////////////////////////////////////////////////////////////////
// ************************************************************* //
// ************************* HELPERS *************************** //
// ************************************************************* //
///////////////////////////////////////////////////////////////////

export const getLogsForRange = async ({minMillis, maxMillis, uid}) => {
  try {
    let docs = [];
    const ref = db.locationLogs(uid);

    const [snap, lastDoc] = await Promise.all([
      ref
        .where('timeRange.max', '>=', minMillis)
        .where('timeRange.max', '<=', maxMillis)
        .orderBy('timeRange.max')
        .get(),
      ref
        .where('timeRange.max', '>', maxMillis)
        .orderBy('timeRange.max')
        .limit(1)
        .get(),
    ]);

    if (!snap.empty) docs = snap.docs;
    if (!lastDoc.empty && maxMillis >= lastDoc.docs[0].data().timeRange.min)
      docs.push(lastDoc.docs[0]);

    const allLogs = [];
    docs.forEach((doc) => {
      const logs = doc.data().logs;
      for (let log of logs) {
        if (log.timestamp > maxMillis) break;
        else if (log.timestamp >= minMillis) allLogs.push(log);
      }
    });

    return allLogs;
  } catch (error) {
    throw error;
  }
};

export const changeTaskStatus = (uid, taskId, newStatus) =>
  db.userTasks(uid).doc(taskId).set(
    {
      status: newStatus,
      updatedAt: new Date(),
    },
    {merge: true},
  );

export const withTriggerTask = (
  taskId,
  task = ({uid, taskId, change, context, global}) => Promise.resolve(),
) => {
  return functions.firestore
    .document(`users/{uid}/tasks/${taskId}`)
    .onWrite(async (change, context) => {
      try {
        const prevStatus = change.before.data().status;
        const newStatus = change.after.data().status;

        if (prevStatus === newStatus || newStatus !== 'triggered') return;
        const uid = context.params.uid;

        //get global constants and change task status to pending
        const [global, dummmy] = await Promise.all([
          Firestore.get(db.global_constants),
          changeTaskStatus(uid, taskId, 'pending'),
        ]);

        await task({uid, taskId, change, context, global});
        await changeTaskStatus(uid, taskId, 'completed');
      } catch (e) {
        console.log(`${taskId} ERROR:`, e);
        try {
          await changeTaskStatus(context.params.uid, taskId, 'failed');
        } catch (error) {
          console.log('changeTaskStatus ERROR:', error);
        }
      }
    });
};
