import React from 'react';
import { StyleSheet, Text, View, ListView, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';

import * as firebase from 'firebase';
const StatusBar = require('./components/StatusBar');
const ActionButton = require('./components/ActionButton');
const ListItem = require('./components/ListItem');
const styles = require('./styles.js');

import { Camera, Permissions } from 'expo';

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






const oldStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
