/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {LoggingHeadlessTask} from './src/services/logging';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask('Heartbeat', () => LoggingHeadlessTask);
