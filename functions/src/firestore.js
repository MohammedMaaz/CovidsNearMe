import getKey from 'lodash.get';

const get = async (docRef) => {
  try {
    const doc = await docRef.get();
    if (!doc.exists) return null;

    return {id: doc.id, ...doc.data()};
  } catch (e) {
    throw e;
  }
};

const get_value = async (docRef, key, fallback) => {
  try {
    const doc = await get(docRef);
    if (!doc) throw 'doc does not exist';
    return getKey(doc, key, fallback);
  } catch (e) {
    if (fallback) return fallback;
    throw e;
  }
};

const stream = (docRef, handler = () => {}, error = () => {}) => {
  const unsubscriber = docRef.onSnapshot((snap) => {
    if (snap.exists) handler({id: snap.id, ...snap.data()});
    else handler(null);
  }, error);
  return unsubscriber;
};

const Firestore = {
  get,
  get_value,
  stream,
};

export default Firestore;
