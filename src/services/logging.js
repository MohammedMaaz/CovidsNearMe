import {NativeModules} from 'react-native';
import {c_user, firebase} from '../config/firebase';
const {Heartbeat} = NativeModules;
import AsyncStorage from '@react-native-community/async-storage';
import {getLocation} from '../utils/geolocation';

const LoggingService = {
  start: () => Heartbeat.startService(),
  stop: () => Heartbeat.stopService(),
};
export default LoggingService;

export const LoggingHeadlessTask = async data => {
  try {
    if (c_user()) {
      //if user is logged in
      await logger(); //retreiving location and logging it locally
      //pusher(); //push locally saved logs to firestore
    }
  } catch (error) {
    console.log('Headless Task Error:', error);
  }
};

const config = {
  loggingInterval: 10, //secs
  pushInterval: 30, //mins
};

const pusher = (() => {
  let nextPushTime = null;

  const clearLogs = async () => {
    try {
      await AsyncStorage.removeItem('@logs');
    } catch (error) {
      console.log('Error clearing logs', error);
    }
  };

  const getLogs = async () => {
    try {
      const logs = await AsyncStorage.getItem('@logs');
      return JSON.parse(logs);
    } catch (error) {
      console.log('Error getting logs', error);
      return null;
    }
  };

  const restoreClearedLogs = async logs => {
    try {
      const currLogs = await getLogs();
      let newLogs;
      if (currLogs) {
        newLogs = logs.concat(currLogs);
      } else {
        newLogs = logs;
      }

      await AsyncStorage.setItem('@logs', JSON.stringify(newLogs));
    } catch (error) {
      console.log('Error restoring cleared logs:', error);
    }
  };

  const pushLogs = async logs => {
    try {
      await firebase.functions().httpsCallable('logsEntry')({logs});
    } catch (error) {
      console.log('Error pushing logs', error);
      nextPushTime -= config.pushInterval * 60000;
      await restoreClearedLogs();
    }
  };

  return async () => {
    let logs = null;
    if (!nextPushTime) {
      logs = await getLogs();
      if (logs) nextPushTime = logs[0].timestamp + config.pushInterval * 60000;
    }
    if (Date.now() >= nextPushTime) {
      logs = logs || (await getLogs());
      if (logs) {
        nextPushTime += config.pushInterval * 60000;
        await clearLogs();
        await pushLogs(logs);
      }
    }
  };
})();

const logger = (nextLogTime => {
  const pushNewLog = async log => {
    try {
      const currLogs = await AsyncStorage.getItem('@logs');
      let newLogs;
      if (currLogs !== null) {
        newLogs = JSON.parse(currLogs);
        newLogs.push(log);
      } else {
        newLogs = [log];
      }

      await AsyncStorage.setItem('@logs', JSON.stringify(newLogs));
    } catch (error) {
      console.log('Error pushing log to localStorage:', error);
      nextLogTime -= config.loggingInterval * 1000;
    }
  };

  const getNewLog = async () => {
    try {
      const loc = await getLocation({});
      return {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        altitude: loc.coords.altitude,
        timestamp: loc.timestamp,
      };
    } catch (error) {
      console.log('Error getting location', error);
      return null;
    }
  };

  return async () => {
    if (Date.now() >= nextLogTime) {
      const log = await getNewLog();
      if (log) {
        nextLogTime += config.loggingInterval * 1000;
        await pushNewLog(log);
        console.log('Log:', log);
      }
    }
  };
})(Date.now());
