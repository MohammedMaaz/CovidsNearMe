import React from 'react';
import {Router as FluxRouter, Scene, Actions} from 'react-native-router-flux';
import Splash from '../views/Splash/Index';
import Login from '../views/Login/Index';
import AlertPopup from '../components/AlertPopup/Index';

const Router = props => {
  return (
    <FluxRouter backAndroidHandler={onBackPressed} sceneStyle={{flex: 1}}>
      <Scene key="root" hideNavBar>
        <Scene key="Splash" initial component={Splash} />
        <Scene key="Login" component={Login} />
      </Scene>
    </FluxRouter>
  );
};

const onBackPressed = () => {
  if (Actions.state.index === 0) {
    AlertPopup({
      title: 'Exit App',
      message: 'Are you sure to exit the application',
      onOk: () => {
        Models.cleanRest();
        BackHandler.exitApp();
      },
      onCancel: () => {},
    });
  } else {
    Actions.pop();
  }
  return true;
};

export default Router;
