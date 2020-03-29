import throttle from 'lodash.throttle';
import {firebase} from '../config/firebase';

const login_with_phone_num = phoneNumber => {
  return firebase.auth().signInWithPhoneNumber(phoneNumber);
};

const verify_code = (code, result) => {
  return result.confirm(code);
};

const resend_code = phoneNumber => {
  return firebase.auth().signInWithPhoneNumber(phoneNumber, true);
};

const logout = () => {
  return firebase.auth().signOut();
};

const subscribe = handler => {
  //throttle handler to prevent it being called multiple times for the same event
  return firebase
    .auth()
    .onAuthStateChanged(throttle(handler, 500, {trailing: false}));
};

const Auth = {
  login_with_phone_num,
  verify_code,
  logout,
  subscribe,
  resend_code,
};

export default Auth;
