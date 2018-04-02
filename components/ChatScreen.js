import React from 'react';
import { Text, View, ListView, Alert, Modal, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

import AppIntroSlider from 'react-native-app-intro-slider';

import * as firebase from 'firebase';
const ActionButton = require('./ActionButton');
const ListItem = require('./ListItem');
const styles = require('../styles.js');

import { Camera, Permissions, ImagePicker } from 'expo';

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
            textToSend: '',
            hasCameraPermission: null,
            type: Camera.Constants.Type.back,

            demoMode: false,
            userDisplayName: '',
            pairDisplayName: 'Jordan', // TODO: This is currently hardcoded
            userID: '111',
            pairID: '222',

            messagesRef: '', // This should be overwritten always.

            userDisplayNameTooShortReminder: ' ',
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
        // var vimportant;
        // TODO: If demomode: use hardcoded values
        //userSetupDict['notificationSchedule'] = "[’08:00’, null, null, ’14:00’, null, null, ’20:00’]";

        let userSetupDict = {};
        userSetupDict['userID'] = String(this.getRandomInt(0, 1000000));
        // userSetupDict['userDisplayName'] = 'Demo User ' + userSetupDict['userID']; // TODO: Get this from the user
        userSetupDict['longestStreak'] = '0';
        userSetupDict['currentStreak'] = '0';
        userSetupDict['notificationSchedule'] = "[null, null, null, null, null, null, null]";

        this.state.userID = userSetupDict['userID'];
        // this.state.userDisplayName = userSetupDict['userDisplayName'];

        // TODO: Set the conversation key as a state variable so it can be used later

        // Search conversations ref for a conversation that isn't full
        let potentialConversationKey = null;
        let temp = firebaseApp.database().ref('conversations/').orderByChild('conversationMemberCount').equalTo(1).on("value", function(snapshot) {
            snapshot.forEach(function(data) {
                console.log(data.key);
                potentialConversationKey = data.key;
            });
        });
        temp.off;

        if(potentialConversationKey !== null) { // If a conversation was found
            userSetupDict['userConversationKey'] = potentialConversationKey; // Add the new user to that conversation
            this.state.localConversationKey = potentialConversationKey; // Save for later use
            //this.state.messagesRef = firebaseApp.database().ref('conversations/' + potentialConversationKey + '/messages/');
            //vimportant = firebaseApp.database().ref('conversations/' + potentialConversationKey + '/messages');
            firebaseApp.database().ref('conversations/').child(potentialConversationKey).child('conversationMemberCount').set(2); // Set the conversation member count to 2 members

        } else { // Otherwise create a new conversation to add the new user to
            let potentialConversationID, IDTaken;

            do { // Keep generating new conversation IDs until we get one that isn't used in a pre-existing conversation
                potentialConversationID = String(this.getRandomInt(0, 1000000000000));
                IDTaken = false;

                let temp = firebaseApp.database().ref('conversations/').orderByChild('conversationID').equalTo(potentialConversationID).on("value", function (snapshot) {
                    snapshot.forEach(function (data) {
                        console.log('Conversation ID is already in use.');
                        if(data.key !== null) {
                            IDTaken = true;
                        }
                    });
                });
            } while(IDTaken === true);

            let conversationSetupDict = {};
            conversationSetupDict['conversationID'] = potentialConversationID;
            conversationSetupDict['conversationMemberCount'] = 0;

            // Write the new conversation object to Firebase
            firebaseApp.database().ref('conversations/').push().set(conversationSetupDict);

            // Again, search conversations ref for a conversation that isn't full. We expect to find our newly created conversation here
            potentialConversationKey = null;
            let temp2 = firebaseApp.database().ref('conversations/').orderByChild('conversationMemberCount').equalTo(0).on("value", function(snapshot) {
                snapshot.forEach(function(data) {
                    console.log(data.key);
                    potentialConversationKey = data.key;
                });
            });
            temp2.off;

            if(potentialConversationKey !== null) { // If a conversation was found
                userSetupDict['userConversationKey'] = potentialConversationKey; // Add the new user to that conversation
                this.state.localConversationKey = potentialConversationKey; // Save for later use
                //this.state.messagesRef = firebaseApp.database().ref('conversations/' + potentialConversationKey + '/messages/');
                //vimportant = firebaseApp.database().ref('conversations/' + potentialConversationKey + '/messages');
                firebaseApp.database().ref('conversations/').child(potentialConversationKey).child('conversationMemberCount').set(1); // Set the conversation member count to 1 member

                firebaseApp.database().ref('conversations/' + this.state.localConversationKey + '/messages/').push().set({
                    content: 'Welcome to Pact! You\'re now connected to a chat room with your partner. Introduce yourselves and set your goals!',
                    authorDisplayName: 'System',
                });
            } else {
                // Otherwise, a VERY unlikely event has happened and the app should exit. What happened is probably that the user
                // lost connection after creating the new conversation, another new user who had previously lost connection reconnected
                // and joined the conversation, and then the original new user reconnects to find no conversation to join.
                // TODO: Determine whether this is problem could actually happen and if it could, fix it
                Alert.alert(
                    'Fatal error',
                    "An unlikely fatal error has occurred. Please restart the app."
                );
            }
        }


        firebaseApp.database().ref('users/').push().set(userSetupDict);

        console.log("Finished setting up new user!");
        //this.listenForItems(this.itemsRef);
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

    async componentWillMount() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    }

    componentDidMount() {
        //this.listenForItems(firebaseApp.database().ref('conversations/'));
        this.listenForItems(this.itemsRef);
    }

    listenForItems(itemsRef) {
        // Search conversations ref for a conversation that isn't full
        // let potentialConversationKey = null;
        // firebaseApp.database().ref('conversations/').orderByChild('conversationMemberCount').equalTo(1).on("value", function(snapshot) {
        //     snapshot.forEach(function(data) {
        //         console.log(data.key);
        //         potentialConversationKey = data.key;
        //     });
        // });

        //firebaseApp.database().ref('conversations/' + this.state.localConversationKey + '/messages/').on('value', (snap) => {

        itemsRef.on('value', (snap) => {
            // get children as an array
            let items = [];
            snap.child('conversations').child(this.state.localConversationKey).child('messages').forEach((child) => {
                items.push({
                    content: child.val().content,
                    authorDisplayName: child.val().authorDisplayName,
                    authorID: child.val().authorID,
                    pictureApproved: child.val().pictureApproved,
                    _key: child.key,

                    userDisplayName: this.state.userDisplayName,
                    localConversationKey: this.state.localConversationKey, // Not very efficient. I am doing this to pass the user's ID and the user's pair's ID info to ListItem so I can render posts accordingly
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
                text: 'The first two weeks are the hardest.\n' +
                'But this time you aren\'t alone.',
                //image: require('./assets/3.jpg'),
                imageStyle: stylesSlider.image,
                backgroundColor: '#22bcb5',
            }
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
                        <TouchableOpacity onPress={() => {}} >
                            <Image source={require('../resources/mocksegmentedcontrol.png')}/>
                        </TouchableOpacity>
                        <Text style={{fontSize: 25}}> </Text>
                        <Text style={{fontSize: 15, textAlign: 'center'}}>Note: You may change this schedule in the future, but only by asking your partner to change your settings for you.</Text>
                        <Text style={{fontSize: 50}}> </Text>
                        <Text style={{fontSize: 25}}>Lastly, what's your name?</Text>
                        <TextInput
                            // style={{width: 225, height: 40}}
                            style={{padding: 10, width: 225}}
                            textAlign={'center'}
                            placeholder = {"Jeff"}
                            autoFocus = {false}
                            autoCapitalize = {"words"}
                            onChangeText = {(name) => this.setState({userDisplayName: name})}
                            {...this.props} // Inherit any props passed to it; e.g., multiline, numberOfLines below
                            editable = {true}
                            maxLength = {20}
                            multiline = {false}
                        />
                        <Text style={{color: 'red'}}>{this.state.userDisplayNameTooShortReminder}</Text>
                        <Text style={{fontSize: 150}}> </Text>
                    </View>
                    <ActionButton title={"Submit"} onPress={() => {
                        if(this.state.userDisplayName === '') {
                            this.setState({userDisplayNameTooShortReminder: "Don't forget to enter a name!"});
                        }
                        else {
                            this.createNewUser();
                            this.hideInitialRoutineModal();
                        }
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
                            maxLength = {200}
                            multiline = {true}
                            numberOfLines = {4}
                        />

                        <ActionButton title={"Submit"} onPress={() => {
                            // Appends a new message to the conversation the user is in
                            firebaseApp.database().ref('conversations/' + this.state.localConversationKey + '/messages/').push().set({
                                content: this.state.textToSend,
                                authorDisplayName: this.state.userDisplayName,
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
                {text: 'Picture', onPress: () => {
                    ImagePicker.launchCameraAsync({
                            mediaTypes: "Images",
                            quality: 0.1,
                            base64: true,
                        }).then(
                            data => {
                                console.log("Camera closed!");
                                if(data.cancelled) {
                                    console.log("User didn't take a picture so I am returning");
                                    return;
                                }

                                // Appends a new message to the conversation the user is in
                                firebaseApp.database().ref('conversations/' + this.state.localConversationKey + '/messages/').push().set({
                                    content: data.base64,
                                    pictureApproved: false,
                                    authorDisplayName: this.state.userDisplayName,
                                });
                            },
                            error => console.error("There was an error taking a photo ", error)
                    )
                }


                },
            ],
            { cancelable: true }
        )
    }

    onApprove(item) {
        firebaseApp.database().ref('conversations/' + this.state.localConversationKey + '/messages/').push().set({
            content: 'Hello',
            authorDisplayName: 'Test',
            pictureApproved: item.pictureApproved,
            // TODO: Get the reference id for each message and use it to set the pictureApproved field to true
        });
    }

    onDeny(item) {
        // TODO
    }


    _renderItem(item) {
        console.log(item); // TODO: Move the "if should render" logic out of ListItem.render() and into here
            return(
                <ListItem item={item} onApprove={() => this.onApprove(item)} onPress= {() => {}}/>
            );
    }
}


export default ChatScreen;