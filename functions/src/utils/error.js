import {functions} from './firebase';

export const error = (code, msg, details) => {
  switch (code) {
    case 'ok':
      msg = msg || 'ok';
      break;
    case 'cancelled':
      msg = msg || 'Operation cancelled due to an unexpected error';
      break;
    case 'unknown':
      msg = msg || 'An unknown error occurred';
      break;
    case 'invalid-argument':
      msg = msg || 'Invalid argument provided';
      break;
    case 'deadline-exceeded':
      msg = msg || 'Deadline exceeded for the task';
      break;
    case 'not-found':
      msg = msg || 'Resource not found';
      break;
    case 'already-exists':
      msg = msg || 'The requested resource already exists';
      break;
    case 'permission-denied':
      msg =
        msg || 'You have insufficient permissions to perform this operation';
      break;
    case 'resource-exhausted':
      msg = msg || 'resource-exhausted';
      break;
    case 'failed-precondition':
      msg = msg || 'Failed precondition for the requested operation';
      break;
    case 'aborted':
      msg = msg || 'Operation aborted due to an error';
      break;
    case 'out-of-range':
      msg = msg || 'Out of range';
      break;
    case 'unimplemented':
      msg = msg || 'This feature is currently unimplemented';
      break;
    case 'internal':
      msg = msg || 'An internal error occurred';
      break;
    case 'unavailable':
      msg = msg || 'The service requested is currently unavailable';
      break;
    case 'data-loss':
      msg = msg || 'Data loss';
      break;
    case 'unauthenticated':
      msg = msg || 'User is not signed in';
      break;
    default:
      code = 'unknown';
      msg = msg || 'An unknown error occurred';
      break;
  }

  return new functions.https.HttpsError(code, msg, details);
};
