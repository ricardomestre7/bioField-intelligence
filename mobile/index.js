/**
 * Super App Regenerativo - Entry Point
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Configurações globais
import './src/config/GlobalConfig';

// Polyfills necessários
import 'react-native-gesture-handler';
import 'react-native-get-random-values';

// Configuração do console para desenvolvimento
if (__DEV__) {
  import('./src/config/ReactotronConfig').then(() => console.log('Reactotron Configured'));
}

// Registra o componente principal
AppRegistry.registerComponent(appName, () => App);

// Configuração para background tasks
AppRegistry.registerHeadlessTask('BackgroundSync', () => {
  return require('./src/services/BackgroundService').backgroundSync;
});

AppRegistry.registerHeadlessTask('NotificationHandler', () => {
  return require('./src/services/NotificationService').backgroundNotificationHandler;
});

AppRegistry.registerHeadlessTask('LocationUpdate', () => {
  return require('./src/services/LocationService').backgroundLocationUpdate;
});

AppRegistry.registerHeadlessTask('IoTDataSync', () => {
  return require('./src/services/IoTService').backgroundDataSync;
});

AppRegistry.registerHeadlessTask('BlockchainSync', () => {
  return require('./src/services/BlockchainService').backgroundBlockchainSync;
});