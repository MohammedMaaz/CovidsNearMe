import {BackHandler} from 'react-native';

export const delay = duration =>
  new Promise(res => setTimeout(() => res(), duration));

export const random_numeric_string = digits => {
  const offset = Math.pow(10, digits);
  return (Math.floor(Math.random() * offset) + offset).toString().substring(1);
};

export const random_number = (min, max) => min + Math.random() * (max - min);

export const random_int = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const pick_random = arr => arr[Math.floor(Math.random() * arr.length)];

export const gen_hash_string = len => {
  return 'x'.repeat(len).replace(/[xy]/g, c => {
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const remove_key = (obj, key) => {
  let newObj = Object.assign({}, obj);
  delete newObj[key];
  return newObj;
};

export const on_back_press = (callback = () => {}) => {
  return BackHandler.addEventListener('hardwareBackPress', () => {
    callback();
    return true;
  });
};
