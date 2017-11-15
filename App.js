import React from 'react';
import { StyleSheet, Text, View, ListView, Alert } from 'react-native';

import * as firebase from 'firebase';
const StatusBar = require('./components/StatusBar');
const ActionButton = require('./components/ActionButton');
const ListItem = require('./components/ListItem');
const styles = require('./styles.js');

// Initialize Firebase
const firebaseConfig = {
        apiKey: "AIzaSyCBziLkXXnRyWY7Zp2zn11ryV3jrch_NHc",
        authDomain: "pact-siv17.firebaseapp.com",
        databaseURL: "https://pact-siv17.firebaseio.com",
        storageBucket: "pact-siv17.appspot.com",
    };
const firebaseApp = firebase.initializeApp(firebaseConfig);

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            })
        };
        this.itemsRef = firebaseApp.database().ref();
    }

    componentDidMount() {
        this.listenForItems(this.itemsRef);
    }

    listenForItems(itemsRef) {
        itemsRef.on('value', (snap) => {

            // get children as an array
            var items = [];
            snap.forEach((child) => {
                items.push({
                    title: child.val().title,
                    _key: child.key
                });
            });

            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(items)
            });

        });
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar title="Pact"/>
                <ActionButton title={"Add"} onPress={this._addItem.bind(this)} />
            </View>
        )
    }

    _addItem() {
        Alert.alert(
            'Pact',
            "You'd like to record some data...",
            [
                {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'OK', onPress: () => this.itemsRef.push({ title: "Hello from Pact!" })},
            ],
            { cancelable: false }
        )
    }

    _renderItem(item) {
        return(
            <ListItem item={"item"} onPress={() => {}}/>
        );
    }
}



const oldStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
