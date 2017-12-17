import React from 'react';
import { Text, View, ListView, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';

import * as firebase from 'firebase';
const ActionButton = require('./ActionButton');
const ListItem = require('./ListItem');
const styles = require('../styles.js');

import { Camera, Permissions } from 'expo';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCBziLkXXnRyWY7Zp2zn11ryV3jrch_NHc",
    authDomain: "pact-siv17.firebaseapp.com",
    databaseURL: "https://pact-siv17.firebaseio.com",
    storageBucket: "pact-siv17.appspot.com",
};
const firebaseApp = firebase.initializeApp(firebaseConfig);


class ChatScreen extends React.Component {
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
            pairDisplayName: 'Jordan', // TODO: This is currently hardcoded
            userID: '111',
            pairID: '222'
        };
        this.itemsRef = firebaseApp.database().ref();
    }

    static navigationOptions = {
        title: 'Not sure what this corresponds to',
        tabBarLabel: 'Jordan', // TODO: This is currently hardcoded; cannot get from this.state because it's not bound
    };

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
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.container}>
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
                            // let dbDict = {};
                            // dbDict['userDisplayName'] = 'Warren';
                            // dbDict['userID'] = '111';
                            // dbDict['longestStreak'] = '5';
                            // dbDict['currentStreak'] = '2';
                            // dbDict['notificationSchedule'] = "[’08:00’, null, null, ’14:00’, null, null, ’20:00’]";
                            // dbDict['userConversationKey'] = 'hello';

                            //this.itemsRef.push().set(dbDict);
                            

                            // Gets the parent key for the conversation entry we want
                            let conversationKey = "";
                            firebaseApp.database().ref('conversations/').orderByChild('conversationID').equalTo('hello').on("value", function(snapshot) {
                                //console.log(snapshot.val());
                                snapshot.forEach(function(data) {
                                    console.log(data.key);
                                    conversationKey += data.key; // This action should only occur once because there are no other conversations with the given conversationID
                                });
                            });

                            // Appends a new message to the conversation we are interested in
                            firebaseApp.database().ref('conversations/' + conversationKey + '/messages/').push().set({
                                title: "message content",
                                isApproved: false});


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
        console.log(item); // TODO: Move the "if should render" logic out of ListItem.render() and into here
        if (item.authorID !== item.pairID &&
            item.authorID !== item.userID &&
            item.authorID !== '-1') /* ID of -1 is a system message, and is always shown */
        {
            return null;
        } else {
            return(
                <ListItem item={item} onPress= {() => {}}/>
            );
        }
    }
}


export default ChatScreen;