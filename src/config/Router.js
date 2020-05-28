import React from 'react';
import {Router as FluxRouter, Scene, Actions} from 'react-native-router-flux';
import Splash from '../views/Splash/Index';
import Login from '../views/Login/Index';
import VerifyCode from '../views/VerifyCode/Index';
import AlertPopup from '../components/AlertPopup/Index';
import {BackHandler} from 'react-native';
import CovidsTracking from '../views/CovidsTracking/Index';
import Screen1 from '../views/BuilderX/Screen1/src/Screen_1';
import Map from '../views/BuilderX/MapScreen';

const Router = (props) => {
  return (
    <FluxRouter backAndroidHandler={onBackPressed} sceneStyle={{flex: 1}}>
      <Scene key="root" hideNavBar>
        <Scene key="Splash" initial component={Splash} />
        <Scene key="Login" component={Login} />
        <Scene key="VerifyCode" component={VerifyCode} />
        <Scene key="CovidsTracking" component={CovidsTracking} />
        <Scene key="BX_screen_1" component={Screen1} />
        <Scene key="BX_map_screen" component={Map} />
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
