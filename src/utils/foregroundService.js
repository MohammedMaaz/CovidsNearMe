import {NativeModules} from 'react-native';
const {Heartbeat} = NativeModules;

let tasks = [];

const reflect = p =>
  p.then(
    v => ({v, status: 'fulfilled'}),
    e => ({e, status: 'rejected'}),
  );

const add_task = task => {
  if (typeof task === 'function') tasks.push(task);
};

const start = (task = null) => {
  if (typeof task === 'function') {
    tasks = [task];
  }
  Heartbeat.startService();
};

const stop = () => {
  Heartbeat.stopService();
};

const ForegeoundService = {
  add_task,
  start,
  stop,
};

export default ForegeoundService;

let i = 0;
export const HeadlessTask = async () => {
  console.log('service running... ', ++i);
  //await Promise.all(tasks.map(task => reflect(task())));
};
