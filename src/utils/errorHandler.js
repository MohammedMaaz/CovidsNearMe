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

  if (error.message) Toast.show(error.message, 5);
  else Toast.fail('An error occurred!', 3);

  if (e.stopLoading) dispatch(loadingStopped(e.stopLoading));
};
