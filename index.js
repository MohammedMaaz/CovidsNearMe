/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {HeadlessTask} from './src/utils/foregroundService';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask('Heartbeat', () => HeadlessTask);
