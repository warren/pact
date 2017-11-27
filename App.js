import React from 'react';
import { StyleSheet, Text, View, ListView, Alert, Modal, TextInput} from 'react-native';

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
            }),
            modalVisible: false,
            textToSend: '',
        };
        this.itemsRef = firebaseApp.database().ref();
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
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
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {alert("Modal has been closed.")}}
                >
                    <View style={{marginTop: 22}}>
                        <View>
                            <Text>Send text</Text>
                            <TextInput
                                placeholder={"it is monday my dudes"}
                                onChangeText={(text) => this.setState({textToSend:text})}
                                {...this.props} // Inherit any props passed to it; e.g., multiline, numberOfLines below
                                editable = {true}
                                maxLength = {40}
                                multiline = {true}
                                numberOfLines = {4}
                            />

                            <ActionButton title={"Submit"} onPress={() => {
                                this.itemsRef.push({ title: this.state.textToSend });
                                this.setModalVisible(!this.state.modalVisible);
                            }}>
                            </ActionButton>

                            <Text></Text>
                            <ActionButton title={"Cancel"} onPress={() => {
                                this.setModalVisible(!this.state.modalVisible)
                            }}>
                            </ActionButton>
                        </View>
                    </View>
                </Modal>
                <ListView dataSource={this.state.dataSource} renderRow={this._renderItem.bind(this)} style={styles.listview}/>
                <ActionButton title={"Check In"} onPress={this._addItem.bind(this)} />
            </View>
        )
    }

    _addItem() {
        Alert.alert(
            'Pact',
            "You'd like to record some data...",
            [
                {text: 'Text', onPress: () => this.setModalVisible(!this.state.modalVisible)},
                {text: 'Picture', onPress: () => this.itemsRef.push({ title: "Picture from Pact" })},
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
