import React, {Component} from 'react';
import dva from 'dva';
import {createMemoryHistory} from 'history';
import {Provider} from '@ant-design/react-native';
import {globalErrorHandler} from './src/utils/errorHandler';
import Router from './src/config/Router';

const dvaInit = props => {
  const app = dva({
    history: createMemoryHistory(),
    onError(e, dispatch) {
      globalErrorHandler(e, dispatch);
    },
  });

  app.model(require('./src/models/auth').default);

  app.router(() => (
    <Provider>
      <Router />
    </Provider>
  ));

  return app.start();
};

let DvaApp = null;
class App extends Component {
  constructor() {
    super();
    DvaApp = dvaInit();
  }
  render() {
    return <DvaApp />;
  }
}

export default App;
