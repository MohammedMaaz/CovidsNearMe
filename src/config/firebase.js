import FB from '@react-native-firebase/app';
import '@react-native-firebase/firestore';
import '@react-native-firebase/auth';
import '@react-native-firebase/storage';
import '@react-native-firebase/functions';
import '@react-native-firebase/messaging';
import '@react-native-firebase/database';

//db refs
const _db = FB.firestore();
const users = _db.collection('users');
const alerts = uid => users.doc(uid).collection('alerts');
const locationLogs = uid => users.doc(uid).collection('locationLogs');
const nearbyUsers = uid => users.doc(uid).collection('nearbyUsers');

//exports
export const db = {
  users,
  alerts,
  locationLogs,
  nearbyUsers,
};

export const firebase = FB;
export const c_user = () => FB.auth().currentUser;
