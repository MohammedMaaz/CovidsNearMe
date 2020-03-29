import Geo from './geolocation';
import {random_number, random_int, snapMillisToTrailing} from './utils';
import {db} from './firebase';

const genrateRandLogDocs = ({cLat, cLng, meters, days, intervalSecs}) => {
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

export const logsToHasMap = (
  logDocs,
  radiusMeters,
  millisTolerance,
  precesion,
  error,
) => {
  const hashMap = {};
  for (let doc of logDocs) {
    for (let log of doc.logs) {
      const {lat, lng, timestamp} = log;
      const hashes = Geo.get_circle_hashes(
        lat,
        lng,
        radiusMeters,
        precesion,
        error,
      );
      for (let hash of hashes) {
        const t1 = snapMillisToTrailing(timestamp, millisTolerance);
        if (hashMap[hash]) hashMap[hash].push(...[t1, t1 + millisTolerance]);
        else hashMap[hash] = [t1, t1 + millisTolerance];
      }
    }
  }

  //flatten the hours Array
  for (let hash in hashMap) {
    hashMap[hash] = [...new Set(hashMap[hash])];
  }

  return hashMap;
};

const calculateMeanHoursArray = hashMap => {
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
  testDays = 14,
  testIntervalSecs = 20,
  pointRadius = 5,
  hashPrecesion = 5,
  hoursTolerance = 4,
  error = 10,
}) => {
  const logDocs = genrateRandLogDocs({
    cLat,
    cLng,
    meters: testRadius,
    days: testDays,
    intervalSecs: testIntervalSecs,
  });
  const hashMap = aggregateLogsToHasMap(
    logDocs,
    pointRadius,
    hoursTolerance,
    hashPrecesion,
    error,
  );
  console.log('Hashes:', Object.keys(hashMap).length);
  console.log('Mean Hour Array Size:', calculateMeanHoursArray(hashMap));
};

export const getLogs = async ({minMillis, maxMillis, snapMillis, uid}) => {
  try {
    const t1 = snapMillisToTrailing(minMillis, snapMillis);
    const t2 = snapMillisToTrailing(maxMillis, snapMillis);

    const docs = await db
      .locationLogs(uid)
      .where('timeRange.min', '>=', t1)
      .where('timeRange.min', '<=', t2)
      .get();

    const logs = [];
    docs.forEach(doc => logs.push({id: doc.id, ...doc.data()}));

    return logs;
  } catch (error) {
    throw error;
  }
};

export const changeTaskStatus = (uid, taskId, newStatus) =>
  db
    .userTasks(uid)
    .doc(taskId)
    .set(
      {
        status: newStatus,
        updatedAt: new Date(),
      },
      {merge: true},
    );
