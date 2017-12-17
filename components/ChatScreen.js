import React from 'react';
import { Text, View, ListView, Alert, Modal, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

import AppIntroSlider from 'react-native-app-intro-slider';

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
            introModalVisible: true,
            initialRoutineModalVisible: true,
            textModalVisible: false,
            cameraModalVisible: false,
            textToSend: '',
            hasCameraPermission: null,
            type: Camera.Constants.Type.back,

            demoMode: false,
            userDisplayName: 'Warren',
            pairDisplayName: 'Jordan', // TODO: This is currently hardcoded
            userID: '111',
            pairID: '222'
        };
        this.itemsRef = firebaseApp.database().ref();
    }

    static navigationOptions = {
        title: 'Not sure what this corresponds to',
        tabBarLabel: 'Pact',
    };

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
    }

    createNewUser() {

        // TODO: If demomode: use hardcoded values
        //userSetupDict['notificationSchedule'] = "[’08:00’, null, null, ’14:00’, null, null, ’20:00’]";

        let userSetupDict = {};
        userSetupDict['userID'] = String(this.getRandomInt(0, 100));
        userSetupDict['userDisplayName'] = 'Demo User ' + userSetupDict['userID'];
        userSetupDict['longestStreak'] = '0';
        userSetupDict['currentStreak'] = '0';
        userSetupDict['notificationSchedule'] = "[null, null, null, null, null, null, null]";

        this.userID = userSetupDict['userID'];
        this.userDisplayName = userSetupDict['userDisplayName'];

        // TODO: Set the conversation key as a state variable so it can be used later

        // Search conversations ref for a conversation that isn't full
        let potentialConversationKey = null;
        firebaseApp.database().ref('conversations/').orderByChild('conversationMemberCount').equalTo(1).on("value", function(snapshot) {
            snapshot.forEach(function(data) {
                console.log(data.key);
                potentialConversationKey = data.key;
            });
        });

        if(potentialConversationKey !== null) { // If a conversation was found
            userSetupDict['userConversationKey'] = potentialConversationKey; // Add the new user to that conversation
            firebaseApp.database().ref('conversations/').child(potentialConversationKey).child('conversationMemberCount').set(2); // Set the conversation member count to 2 members

        } else { // Otherwise create a new conversation to add the new user to
            let potentialConversationID, IDTaken;

            do { // Keep generating new conversation IDs until we get one that isn't used in a pre-existing conversation
                potentialConversationID = String(this.getRandomInt(0, 1000000000000));
                IDTaken = false;

                firebaseApp.database().ref('conversations/').orderByChild('conversationID').equalTo(potentialConversationID).on("value", function (snapshot) {
                    snapshot.forEach(function (data) {
                        console.log('Conversation ID is already in use.');
                        if(data.key !== null) {
                            IDTaken = true;
                        }
                    });
                });
            } while(IDTaken === true);

            let messageSetupDict = {};
            messageSetupDict['content'] = 'Welcome to Pact! To get the conversation started: Where are you from? What goal have you set for yourself and why?';
            messageSetupDict['authorDisplayName'] = 'System';

            let conversationSetupDict = {};
            conversationSetupDict['conversationID'] = potentialConversationID;
            conversationSetupDict['conversationMemberCount'] = 0;
            conversationSetupDict['messages'] = messageSetupDict;

            // Write the new conversation object to Firebase
            firebaseApp.database().ref('conversations/').push().set(conversationSetupDict);

            // Again, search conversations ref for a conversation that isn't full. We expect to find our newly created conversation here
            potentialConversationKey = null;
            firebaseApp.database().ref('conversations/').orderByChild('conversationMemberCount').equalTo(0).on("value", function(snapshot) {
                snapshot.forEach(function(data) {
                    console.log(data.key);
                    potentialConversationKey = data.key;
                });
            });

            if(potentialConversationKey !== null) { // If a conversation was found
                userSetupDict['userConversationKey'] = potentialConversationKey; // Add the new user to that conversation
                firebaseApp.database().ref('conversations/').child(potentialConversationKey).child('conversationMemberCount').set(1); // Set the conversation member count to 1 member
            } else {
                // Otherwise, an unlikely event has happened and the app should exit. What happened is probably that the user
                // lost connection after creating the new conversation, another new user joined the conversation, and the original
                // new user reconnects to find no conversation to join.
                Alert.alert(
                    'Fatal error',
                    "An unlikely fatal error has occurred. Please restart the app."
                );
            }
        }

        firebaseApp.database().ref('users/').push().set(userSetupDict);

        console.log("Finished setting up new user!");
        return;
    }

    hideIntroModal() {
        this.setState({introModalVisible: false});
    }

    hideInitialRoutineModal() {
        this.setState({initialRoutineModalVisible: false});
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
        const { navigate } = this.props.navigation;

        const stylesSlider = StyleSheet.create({
            image: {
                width: 320,
                height: 320,
            }
        });

        const slides = [
            {
                key: 'intro-slide-0',
                title: 'Welcome to Pact.',
                text: 'The first two weeks of a new habit are the hardest.\n' +
                'With Pact, you\'ll conquer those two weeks with the help of another human being: not a glorified to-do list app.',
                //image: require('./assets/1.jpg'),
                imageStyle: stylesSlider.image,
                backgroundColor: '#59b2ab',
            },
            {
                key: 'intro-slide-1',
                title: 'What\'s going to happen',
                text: 'After this slideshow, Pact will partner you with another person who wants to build a gym routine.',
                //image: require('./assets/2.jpg'),
                imageStyle: stylesSlider.image,
                backgroundColor: '#385ea8',
            },
            {
                key: 'intro-slide-2',
                title: 'Success in pairs',
                text: 'For two weeks, you and your anonymous partner will ensure that you both stick to your gym routines.',
                //image: require('./assets/2.jpg'),
                imageStyle: stylesSlider.image,
                backgroundColor: '#2a6e4c',
            },
            {
                key: 'intro-slide-3',
                title: 'How it will work (1/3)',
                text: 'You will decide on your first routine independently of your partner. Your partner will make a routine too.\n' +
                'You\'ll both commit to at least one definite time per week to work out.',
                //image: require('./assets/2.jpg'),
                imageStyle: stylesSlider.image,
                backgroundColor: '#358a5f',
            },
            {
                key: 'intro-slide-4',
                title: 'How it will work (2/3)',
                text: 'Then, you\'ll go to the gym at your routine times, and you\'ll prove to your partner that you kept your routine by sending them a photo of the gym.',
                //image: require('./assets/2.jpg'),
                imageStyle: stylesSlider.image,
                backgroundColor: '#778aab',
            },
            {
                key: 'intro-slide-5',
                title: 'How it will work (3/3)',
                text: 'After checking your photo, your partner will verify that you went to the gym. Pact will award you another point in your routine streak and when your partner works out, you\'ll verify that they worked out too.',
                //image: require('./assets/3.jpg'),
                imageStyle: stylesSlider.image,
                backgroundColor: '#27d3cf',
            },
            {
                key: 'intro-slide-6',
                title: 'Ready?',
                text: 'The first two weeks are always the hardest.\n' +
                'But this time you aren\'t alone.',
                //image: require('./assets/3.jpg'),
                imageStyle: stylesSlider.image,
                backgroundColor: '#22bcb5',
            }

            //TODO: Add system message saying: 'to get things started, what do you want to do?'
        ];

        return (
            <View style={styles.container}>
                <Modal
                    animationType="fade"
                    transparent={false}
                    visible={this.state.initialRoutineModalVisible}
                    onRequestClose={() => { console.log("onRequestClose() called from within initial routine modal") }}
                >
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Text style={{fontWeight: 'bold', fontSize: 30}}>Your routine</Text>
                        <Text style={{fontSize: 15}}>What times per week will you work out?</Text>
                        <Text style={{fontSize: 50}}> </Text>
                        <Image source={require('../resources/mocksegmentedcontrol.png')}/>
                        <Text style={{fontSize: 25}}> </Text>
                        <Text style={{fontSize: 15, textAlign: 'center'}}>Note: You may change this schedule in the future, but only by asking your partner to change your settings for you.</Text>
                        <Text style={{fontSize: 225}}> </Text>
                    </View>
                    <ActionButton title={"Submit"} onPress={() => {
                        this.createNewUser();
                        this.hideInitialRoutineModal();
                    }}>
                    </ActionButton>
                </Modal>

                <Modal
                    animationType="fade"
                    transparent={false}
                    visible={this.state.introModalVisible}
                    onRequestClose={() => { console.log("onRequestClose() called from within intro modal") }}
                >
                    <AppIntroSlider
                        slides={slides}
                        onDone={() => { this.hideIntroModal() }}
                    />
                </Modal>




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
                            // Retrieves parent key for the conversation entry we want
                            let conversationKey = "";
                            firebaseApp.database().ref('conversations/').orderByChild('conversationID').equalTo('hello').on("value", function(snapshot) {
                                snapshot.forEach(function(data) {
                                    console.log(data.key);
                                    conversationKey += data.key; // This action should only occur once because there are no other conversations with the given conversationID
                                });
                            });

                            // Appends a new message to the conversation we are interested in
                            firebaseApp.database().ref('conversations/' + conversationKey + '/messages/').push().set({
                                title: this.state.textToSend,
                                isApproved: false,
                                // TODO: NEED TO HAVE USER DISPLAY NAME HERE
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
                <ActionButton title={"Send a message"} onPress={this._addItem.bind(this)} />
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