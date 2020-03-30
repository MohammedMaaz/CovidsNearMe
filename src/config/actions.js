export const loadingStarted = namespace => {
  return {
    type: `${namespace}/startLoading`,
  };
};

export const loadingStopped = namespace => {
  return {
    type: `${namespace}/stopLoading`,
  };
};

export const login = phoneNumber => {
  return {
    type: `auth/logInUser`,
    phoneNumber,
  };
};

export const verifyCode = code => {
  return {
    type: `auth/verifyCode`,
    code,
  };
};
