//@ts-nocheck
import {db} from './utils/firebase';
import {getLogsForRange, withTriggerTask} from './utils/helpers';
import {hoursToMillis} from './utils/utils';

export const logsToHasMap = ({
  logs,
  nearDistanceThreshold,
  hashTimeSnapMillis,
  precesion,
  error,
}) => {
  const hashMap = {};
  for (let log of logs) {
    const {lat, lng, timestamp} = log;
    const hashes = Geo.get_circle_hashes(
      lat,
      lng,
      nearDistanceThreshold,
      precesion,
      error,
    );
    for (let hash of hashes) {
      const t1 = snapMillisToTrailing(timestamp, hashTimeSnapMillis);
      if (hashMap[hash]) hashMap[hash].push(...[t1, t1 + hashTimeSnapMillis]);
      else hashMap[hash] = [t1, t1 + hashTimeSnapMillis];
    }
  }

  //flatten the hours Array
  for (let hash in hashMap) {
    hashMap[hash] = [...new Set(hashMap[hash])];
  }

  return hashMap;
};

export default withTriggerTask('aggregateHashMap', async ({global, uid}) => {
  try {
    //prepare config parameters
    const currMillis = Date.now();
    const dangerDuration = global.dangerDuration.value;
    const hashTimeSnap = global.hashTimeSnap.value;
    const nearDistanceThreshold = global.nearDistanceThreshold.value;
    const hashPrecesion = 5; //±2.4 km

    //get previous location logs
    const logs = await getLogsForRange({
      minMillis: currMillis - hoursToMillis(dangerDuration),
      maxMillis: currMillis,
      uid,
    });

    //aggregate logs to hashmap
    const hashMap = logsToHasMap({
      logs,
      nearDistanceThreshold,
      hashTimeSnapMillis: hoursToMillis(hashTimeSnap),
      precesion: hashPrecesion,
      error: 0,
    });

    await db.users.doc(uid).update({hashMap});
  } catch (e) {
    throw e;
  }
});
