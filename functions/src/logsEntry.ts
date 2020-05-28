//@ts-nocheck
import {error} from './utils/error';
import Firestore from './firestore';
import {db, functions, firebase} from './utils/firebase';
import {changeTaskStatus, generateRandLogs} from './utils/helpers';
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

const get_new_log_doc = (uid, firstLog) => {
  return {
    logs: [firstLog],
    filled: false,
    length: 0,
    timeRange: {
      min: firstLog.timestamp,
      max: firstLog.timestamp,
    },
    id: db.locationLogs(uid).doc().id,
  };
};

const getLogDocToFill = async (uid) => {
  try {
    const snap = await db
      .locationLogs(uid)
      .where('filled', '==', false)
      .orderBy('filled')
      .limit(1)
      .get();

    if (snap.empty) return null;
    return {id: snap.docs[0].id, ...snap.docs[0].data()};
  } catch (error) {
    throw error;
  }
};

/*
  copies raw logs to user/{uid}/locationLogs/{locationLogId} by dividing
  the logs into chunks of logSnapInterval size and also triggers the
  aggregateHashMap task after every aggregationInterval 
*/
export default logsEntry = async (data, context) => {
  try {
    //if (!context.auth) throw error('unauthenticated');

    const uid = 'test'; //context.auth.uid;

    //get raw logs from the data
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

    //fetch log doc (doc that has to be filled), global config and aggregateTask
    let [logDoc, global, aggregateTask] = await Promise.all([
      getLogDocToFill(uid),
      Firestore.get(db.global_constants),
      Firestore.get(db.userTasks(uid).doc('aggregateHashMap')),
    ]);

    //get config variables needed
    const aggregationInterval = global.aggregationInterval.value;
    const logsChunkLength = global.logsChunkLength.value;

    //if no existing log doc to fill, then create a new one
    if (!logDoc) logDoc = get_new_log_doc(uid, logs[0]);
    const dbLogs = logDoc.logs;

    //get overwrite index of logDoc and start index of logs to overwrite
    let [logOI, logDocOI] = getOverwriteIndices(
      logs,
      dbLogs,
      logDoc.timeRange.min,
    );

    //copy logs to logDoc(s)
    let batch = firebase.firestore().batch();
    for (let i = logOI; i < logs.length; i++) {
      //if current log doc is completely filled then create a new one
      if (logDoc.logs.length === logsChunkLength) {
        logDoc.filled = true;
        batch.set(
          db.locationLogs(uid).doc(logDoc.id),
          remove_key(logDoc, 'id'),
        );
        logDoc = get_new_log_doc(uid, logs[i++]);
        logDocOI = 1; //index is 1 and not 0 bcoz first log has already been added
      }

      logDoc.logs[logDocOI] = logs[i];
      logDoc.timeRange.max = logs[i].timestamp;
      logDoc.length = logDocOI + 1;
      ++logDocOI;
    }
    batch.set(db.locationLogs(uid).doc(logDoc.id), remove_key(logDoc, 'id'));

    await batch.commit();

    //if aggregate task has completed or failed previously and aggregation time has reached
    if (
      !aggregateTask ||
      (['completed', 'failed'].includes(aggregateTask.status) &&
        Date.now() >=
          aggregateTask.updatedAt.toDate().getTime() +
            aggregationInterval * 60000)
    ) {
      try {
        //then trigger aggregation task
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
