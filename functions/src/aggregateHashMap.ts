//@ts-nocheck
import Geo from './utils/geolocation';
import {error} from './utils/error';
import Firestore from './firestore';
import {db, functions} from './utils/firebase';
import {getLogs, logsToHasMap, changeTaskStatus} from './utils/helpers';
import {hoursToMillis} from './utils/utils';

export default aggregateHashMap = functions.firestore
  .document('users/{uid}/tasks/aggregateHashMap')
  .onWrite(async (change, context) => {
    try {
      if (change.before.data().status !== 'triggered') return;
      const uid = context.params.uid;

      //get global constants and change task status to pending
      const [global, temp] = await Promise.all([
        Firestore.get(db.global_constants),
        changeTaskStatus(uid, 'aggregateHashMap', 'pending'),
      ]);

      const currMillis = Date.now();
      const dangerDuration = global.dangerDuration.value;
      const hoursTolerance = global.hoursTolerance.value;
      const nearDistanceThreshold = global.nearDistanceThreshold.value;
      const hashPrecesion = 5; //±2.4 km

      //get previous logs of location
      const logDocs = await getLogs({
        minMillis: currMillis - hoursToMillis(dangerDuration),
        maxMillis: currMillis,
        snapMillis: hoursToMillis(hoursTolerance),
        uid,
      });

      //aggregate logs to hashmap
      const hashMap = logsToHasMap(
        logDocs,
        nearDistanceThreshold,
        hoursToMillis(hoursTolerance),
        hashPrecesion,
        0,
      );

      //save hashmap inside users/{uid}/hashMap/aggregatedHashMap location
      //and change task status to completed
      await Promise.all([
        db.aggregatedHashMap(uid).set(...hashMap),
        changeTaskStatus(uid, 'aggregateHashMap', 'completed'),
      ]);
    } catch (e) {
      console.log('aggregateHashMap ERROR:', e);
    }
  });
