//@ts-nocheck
import Geo from './utils/geolocation';
import {error} from './utils/error';
import Firestore from './firestore';
import {db, functions, firebase} from './utils/firebase';
import {
  getLogs,
  logsToHasMap,
  changeTaskStatus,
  getUnfilledLog,
  generateRandLogs,
} from './utils/helpers';
import {hoursToMillis, snapMillisToTrailing, remove_key} from './utils/utils';

const getOverwriteIndices = (logs, dbLogs, timeRangeMin) => {
  let i1 = 0,
    i2 = 0;
  for (let log of logs) {
    if (log.timestamp >= timeRangeMin) {
      for (let dbLog of dbLogs) {
        if (dbLog.timestamp > log.timestamp) {
          return [i1, i2];
        }
        ++i2;
      }
      return [i1, i2];
    }
    ++i1;
  }
  return [logs.length, dbLogs.length];
};

const get_new_log_doc = (uid, firstLog, hoursTolerance) => {
  const min = snapMillisToTrailing(
    firstLog.timestamp,
    hoursToMillis(hoursTolerance),
  );
  return {
    logs: [firstLog],
    timeRange: {
      min,
      max: min + hoursToMillis(hoursTolerance),
    },
    id: db.locationLogs(uid).doc().id,
  };
};

const logsEntry = async (data, context) => {
  try {
    //if (!context.auth) throw error('unauthenticated');

    const uid = 'test'; //context.auth.uid;
    const {
      logs = generateRandLogs({
        cLat: 24.860734299999997,
        cLng: 67.0011364,
        radius: 1000,
        minAlt: -20,
        maxAlt: 10,
        hours: 2,
        intervalSecs: 20,
        startTime: Date.now() + 2 * 3600000,
      }),
    } = data;
    const t1 = logs[0].timestamp;
    const t2 = logs[logs.length - 1].timestamp;

    let [logDoc, global, aggregateTask] = await Promise.all([
      getUnfilledLog(t1, t2, uid),
      Firestore.get(db.global_constants),
      Firestore.get(db.userTasks(uid).doc('aggregateHashMap')),
    ]);

    const aggregationFrequency = global.aggregationFrequency.value;
    const hoursTolerance = global.hoursTolerance.value;

    if (!logDoc) logDoc = get_new_log_doc(uid, logs[0], hoursTolerance);
    const dbLogs = logDoc.logs;

    let [i1, i2] = getOverwriteIndices(logs, dbLogs, logDoc.timeRange.min);

    let batch = firebase.firestore().batch();
    for (let i = i1; i < logs.length; i++) {
      if (logs[i].timestamp > logDoc.timeRange.max) {
        batch.set(
          db.locationLogs(uid).doc(logDoc.id),
          remove_key(logDoc, 'id'),
        );
        logDoc = get_new_log_doc(uid, logs[i++], hoursTolerance);
        i2 = 1;
      }

      logDoc.logs[i2] = logs[i];
      ++i2;
    }
    batch.set(db.locationLogs(uid).doc(logDoc.id), remove_key(logDoc, 'id'));

    await batch.commit();

    if (
      !aggregateTask ||
      (['completed', 'failed'].includes(aggregateTask.status) &&
        Date.now() >=
          aggregateTask.updatedAt.toDate().getTime() +
            aggregationFrequency * 60000)
    ) {
      try {
        await changeTaskStatus(uid, 'aggregateHashMap', 'triggered');
      } catch (error) {
        console.log('changeTaskStatus ERROR:', error);
      }
    }

    return 'success';
  } catch (e) {
    console.log('logsEntry ERROR:', e);
    if (e.httpErrorCode) throw e;
    else throw error('unknown', undefined, e);
  }
};

export default logsEntry;
