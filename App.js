import React from 'react';
import { TabNavigator } from 'react-navigation';

import CalendarScreen from './components/CalendarScreen';
import ChatScreen from './components/ChatScreen';
import SettingsScreen from './components/SettingsScreen';


const App = TabNavigator({
    Chat: { screen: ChatScreen },
    Calendar: { screen: CalendarScreen },
    Settings: { screen: SettingsScreen},
});

export default App;