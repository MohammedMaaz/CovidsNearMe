import {Toast} from '@ant-design/react-native';
import {loadingStopped} from '../config/actions';

export const localErrorHandler = props => {
  const {namespace, error, stopLoading} = props;
  throw {error, stopLoading: stopLoading ? namespace : false, namespace};
};

export const globalErrorHandler = (e, dispatch) => {
  e.preventDefault();
  let error = e;

  if (e.error) error = e.error;
  console.log(error);

  if (error.message) Toast.show(error.message, 3000);
  else Toast.show('An error occurred!', 2000);

  if (e.stopLoading) dispatch(loadingStopped(e.stopLoading));
};
