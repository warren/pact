import React from 'react';
import { StyleSheet, Text, View, ListView, Alert, Modal, TextInput, TouchableOpacity, Dimensions } from 'react-native';

import * as firebase from 'firebase';
const StatusBar = require('./components/StatusBar');
const ActionButton = require('./components/ActionButton');
const ListItem = require('./components/ListItem');
const styles = require('./styles.js');

import { Camera, Permissions } from 'expo';

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
            }),
            textModalVisible: false,
            cameraModalVisible: false,
            textToSend: '',
            hasCameraPermission: null,
            type: Camera.Constants.Type.back,
            userDisplayName: 'Warren',
            userID: '111',
            pairID: '222'
        };
        this.itemsRef = firebaseApp.database().ref();
    }

    setTextModalVisible(visible) {
        this.setState({textModalVisible: visible});
    }

    setCameraModalVisible(visible) {
        this.setState({cameraModalVisible: visible});
    }

    async componentWillMount() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
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
                    authorDisplayName: child.val().authorDisplayName,
                    authorID: child.val().authorID,
                    postApproved: child.val().postApproved,
                    _key: child.key,

                    userID: this.state.userID,
                    pairID: this.state.pairID /* Not very efficient. I am doing this to pass the user's ID and the user's pair's ID info to ListItem so I can render posts accordingly */
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
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.textModalVisible}
                    onRequestClose={() => { this.setTextModalVisible(!this.state.textModalVisible) }}
                >
                    <View style={{marginTop: 22}}>
                        <Text>Send text</Text>
                        <TextInput
                            placeholder = {"Write a message to send to your pair"}
                            autoFocus = {true}
                            autoCapitalize = {"sentences"}
                            onChangeText = {(text) => this.setState({textToSend: text})}
                            {...this.props} // Inherit any props passed to it; e.g., multiline, numberOfLines below
                            editable = {true}
                            maxLength = {40}
                            multiline = {true}
                            numberOfLines = {4}
                        />

                        <ActionButton title={"Submit"} onPress={() => {
                            this.itemsRef.push({ title: this.state.textToSend,
                                authorDisplayName: this.state.userDisplayName,
                                authorID: this.state.userID
                            });
                            this.setTextModalVisible(!this.state.textModalVisible);
                        }}>
                        </ActionButton>

                        <Text></Text>
                        <ActionButton title={"Cancel"} onPress={() => {
                            this.setTextModalVisible(!this.state.textModalVisible)
                        }}>
                        </ActionButton>
                    </View>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.cameraModalVisible}
                    onRequestClose={() => { this.setCameraModalVisible(!this.state.cameraModalVisible) }}
                >
                    <View style={{flex: 1}}>
                        <Camera style={{flex: 1}} type={this.state.type}>
                            <View
                                style={{
                                    backgroundColor: 'transparent',
                                    flexDirection: 'row',
                                }}>
                                <TouchableOpacity
                                    style={{
                                        alignSelf: 'flex-end',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        this.setState({
                                            type: this.state.type === Camera.Constants.Type.back
                                                ? Camera.Constants.Type.front
                                                : Camera.Constants.Type.back,
                                        });
                                    }}>
                                    <Text
                                        style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10, color: 'white' }}>
                                        {' '}Flip Camera{' '}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Camera>

                        <ActionButton title={"Send"} onPress={() => {
                            this.setCameraModalVisible(!this.state.cameraModalVisible);
                            this.itemsRef.push({ title: '',
                                authorDisplayName: this.state.userDisplayName,
                                authorID: this.state.userID,
                                postApproved: false,
                            });
                        }}>
                        </ActionButton>
                    </View>
                </Modal>
                <ListView dataSource={this.state.dataSource} renderRow={this._renderItem.bind(this)} style={styles.listview} enableEmptySections={true}/>
                <ActionButton title={"Check In"} onPress={this._addItem.bind(this)} />
            </View>
        )
    }

    _addItem() {
        Alert.alert(
            'Pact',
            "You'd like to record some data...",
            [
                {text: 'Text', onPress: () => this.setTextModalVisible(!this.state.textModalVisible)},
                {text: 'Picture', onPress: () => this.setCameraModalVisible((!this.state.cameraModalVisible))},
            ],
            { cancelable: true }
        )
    }

    _renderItem(item) {
        return(
            <ListItem item={item} onPress= {() => {}}/>
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
