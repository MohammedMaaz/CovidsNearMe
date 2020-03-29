import Auth from '../services/auth';
import {Actions} from 'react-native-router-flux';
import {localErrorHandler} from '../utils/errorHandler';
import {loadingStarted} from '../config/actions';

const namespace = 'auth';

export default {
  namespace,
  state: {
    user: null,
    confirmResult: null,
    phoneNumber: null,
    loading: false,
  },

  effects: {
    *logInUser({phoneNumber}, {put, call}) {
      try {
        yield put(loadingStarted(namespace));

        const confirmResult = yield call(
          Auth.login_with_phone_num,
          phoneNumber,
        );

        yield put({
          type: 'setState',
          payload: {confirmResult, phoneNumber},
        });

        Actions.replace('VerifyCode');
      } catch (error) {
        localErrorHandler({namespace, error, stopLoading: true});
      }
    },

    *verifyCode({code}, {put, call, select}) {
      try {
        yield put(loadingStarted(namespace));

        const confirmResult = yield select(
          state => state[namespace].confirmResult,
        );

        yield call(Auth.verify_code, code, confirmResult);
      } catch (error) {
        localErrorHandler({namespace, error, stopLoading: true});
      }
    },

    *resendCode(action, {put, call, select}) {
      try {
        yield put(loadingStarted(namespace));

        const phoneNumber = yield select(state => state[namespace].phoneNumber);
        const confirmResult = yield call(Auth.resend_code, phoneNumber);

        yield put({type: 'setState', payload: {confirmResult}});
      } catch (error) {
        localErrorHandler({namespace, error, stopLoading: true});
      }
    },

    *logOutUser(action, {put, call}) {
      try {
        yield put(loadingStarted(namespace));
        yield call(Auth.logout);
      } catch (error) {
        localErrorHandler({namespace, error, stopLoading: true});
      }
    },
  },

  subscriptions: {
    authSubscriber({dispatch}) {
      return Auth.subscribe(user => {
        if (user) {
          //if logged in
          dispatch({type: 'setState', payload: {user}});
        } else {
          //if logged out
          dispatch({type: 'setState', payload: {user: null}});
          Actions.reset('Login');
        }
      });
    },
  },

  reducers: {
    setState(state, {payload}) {
      return {...state, ...payload};
    },
    startLoading(state) {
      return {...state, loading: true};
    },
    stopLoading(state) {
      return {...state, loading: false};
    },
  },
};
