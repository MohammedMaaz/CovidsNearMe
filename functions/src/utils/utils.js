export const random_number = (min, max) => min + Math.random() * (max - min);

export const random_int = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const delay = (duration) =>
  new Promise((res) => setTimeout(() => res(), duration));

export const random_numeric_string = (digits) => {
  const offset = Math.pow(10, digits);
  return (Math.floor(Math.random() * offset) + offset).toString().substring(1);
};

export const remove_key = (obj, key) => {
  let newObj = {...obj};
  delete newObj[key];
  return newObj;
};

export const gen_hash_string = (len) => {
  return 'x'.repeat(len).replace(/[xy]/g, (c) => {
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const snapMillisToTrailing = (timeMillis, intervalMillis) => {
  return Math.floor(timeMillis / intervalMillis) * intervalMillis;
};

export const hoursToMillis = (hours) => hours * 3600000;

export const intersection = (array1, array2) => {
  return array1.filter((value) => array2.includes(value));
};
