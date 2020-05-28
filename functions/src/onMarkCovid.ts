//@ts-nocheck
//@ts-nocheck
import {db, firebase} from './utils/firebase';
import {getLogsForRange, withTriggerTask} from './utils/helpers';
import {hoursToMillis, intersection} from './utils/utils';
import Firestore from './firestore';

const promiseChunkSize = 20;

/*timesArray must be <= 10
return users array where every users has:
    id: uid,
    ...data, //user data
    contactTimes: [],
*/
const getUsersInSpaceTime = async (hash, timesArray) => {
  try {
    const users = [];
    const snap = await db.users
      .where(`hashMap.${hash}`, 'array-contains-any', timesArray)
      .where('status.value', '==', 'normal')
      .get();
    snap.forEach((user) => {
      const data = user.data();
      users.push({
        id: user.id,
        ...data,
        contactTimes: intersection(data.hashMap[hash], timesArray),
      });
    });
    return users;
  } catch (error) {
    throw error;
  }
};

/*
    pHashMap = patient hashMap
    get an array of all users which are at risk (share same space-time with patient)
    each element of array is an object like:
        id: uid,
        data, //user daya
        contactTimes: SET times, //all (unique) contact times with patient
*/
const getUsersAtRisk = async (pHashMap) => {
  try {
    let promises = [];
    const allUsers = [];

    for (let [pHash, pTimes] of Object.entries(pHashMap)) {
      let count = 0;
      let times = [];
      for (let time of pTimes) {
        times.push(time);
        count++;

        //getUsersInSpaceTime should only get upto 10 times due to firestroe's
        //array-contains-any query limitation
        if (count === 10) {
          promises.push(getUsersInSpaceTime(pHash, times));

          //slice promises into chunks to avoid hitting parallel execution throughput
          if (promises.length >= promiseChunkSize) {
            const usersArrays = await Promise.all(promises);
            allUsers.push(...[].concat.apply([], usersArrays));
            promises = [];
          }
          count = 0;
          times = [];
        }
      }

      //for remaining times
      promises.push(getUsersInSpaceTime(pHash, times));
    }

    //for remaining promises
    const usersArrays = await Promise.all(promises);
    allUsers.push(...[].concat.apply([], usersArrays));

    //remove duplicate users by merging their contactTimes into one array
    const bigUsersObject = {};
    allUsers.forEach((user) => {
      if (bigUsersObject[user.id])
        bigUsersObject[user.id].contactTimes.push(...user.contactTimes);
      else bigUsersObject[user.id] = user;
    });

    //remove duplicate contactTimes within each user and convert bigUsersObject
    //to an array
    const finalUsers = [];
    Object.entries(bigUsersObject).forEach(([id, user]) => {
      user.contactTimes = new Set(user.contactTimes);
      finalUsers.push(user);
    });

    return finalUsers;
  } catch (error) {
    throw error;
  }
};

const logsPromiseTransformer = (promise, timeMap) =>
  promise.promise.then(
    (logs) => (timeMap[promise.time] = logs),
    (e) => {
      throw e;
    },
  );

const contactTimesToLogs = async (transformedUser, hashTimeSnap) => {
  try {
    let promises = [];
    const timeMap = {};
    for (let time of transformedUser.contactTimes) {
      promises.push({
        time,
        promise: getLogsForRange({
          minMillis: time,
          maxMillis: time + hoursToMillis(hashTimeSnap),
          uid: transformedUser.id,
        }),
      });
      if (promises.length >= promiseChunkSize) {
        await Promise.all(
          promises.map((p) => logsPromiseTransformer(p, timeMap)),
        );
        promises = [];
      }
    }
    await Promise.all(promises.map((p) => logsPromiseTransformer(p, timeMap)));

    transformedUser.contactTimes = timeMap;
  } catch (error) {
    throw error;
  }
};

const getContactDuration = (patientLog, userLog) => {};

export default onMarkCovid = withTriggerTask(
  'onMarkCovid',
  async ({uid, global}) => {
    try {
      const hashTimeSnap = global.hashTimeSnap.value;

      //STEP1 get aggregated hash map of the patient
      const patient = await Firestore.get(db.users.doc(uid));

      //STEP2: query all non-covid users through hash maps which are prone to risk
      const riskyUsers = await getUsersAtRisk(patient.hashMap);

      //STEP3: get a set of all contact times of this patient with other users
      patient.contactTimes = new Set();
      riskyUsers.forEach((user) =>
        user.contactTimes.forEach((time) => patient.contactTimes.add(time)),
      );

      //STEP4: get logs of the patient and other users
      let promises = [];
      promises.push(contactTimesToLogs(patient, hashTimeSnap));
      for (let user of riskyUsers) {
        if (promises.length >= promiseChunkSize) {
          await Promise.all(promises);
          promises = [];
        }
        promises.push(contactTimesToLogs(user, hashTimeSnap));
      }
      await Promise.all(promises);

      //STEP5: compare logs of each user with patient's to get his contact duration and contactLogs
      riskyUsers.forEach((user) => {
        user.contactDuration = 0;
        for (let contactTime in user.contactTimes) {
          const [duration, logs] = getContactDuration(
            patient.contactTimes[contactTime],
            user.contactTimes[contactTime],
          );

          user.contactDuration += duration;
          user.contactLogs = logs;
        }
      });
    } catch (error) {
      throw error;
    }
  },
);
