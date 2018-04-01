import React, {Component} from 'react';
import ReactNative, { Alert, Image } from 'react-native';
const styles = require('../styles.js');
const { View, TouchableHighlight, Text } = ReactNative;

class ListItem extends Component {
    render() {
        if (this.props.item.pictureApproved === undefined) { /* If the post is only text */
            return (
                <TouchableHighlight onPress={this.props.onPress}>
                    <View style={styles.li}>
                        <Text style={styles.liText}>{this.props.item.authorDisplayName + ': ' + this.props.item.content}</Text>
                    </View>
                </TouchableHighlight>
            );
        }

        else { /* If the post contains an approval value then it must be a picture */
            if (this.props.item.authorDisplayName !== this.props.item.userDisplayName) { /* If the post was made by the user's pair */
                return (
                    <TouchableHighlight onPress={() => {
                        Alert.alert(
                            'Approval',
                            "Approve " + this.props.item.authorDisplayName + "'s check-in request?",
                            [
                                {text: 'Cancel', onPress: () => {}},
                                {text: 'No', onPress: () => console.log('No pressed')},
                                {text: 'Yes', onPress: () => console.log('Yes pressed')}
                            ],
                            { cancelable: true }
                        )
                    }}>
                        <View style={styles.li}>
                            <Image style={{width: 100, height: 125, resizeMode: Image.resizeMode.contain, borderWidth: 1, borderColor: 'red'}} source={{uri: 'data:image/png;base64,' + this.props.item.content}}/>
                            <Text
                                style={styles.liTextNotApproved}>{ this.props.item.authorDisplayName + ' checked in via photo.\nApproval status: ' + this.props.item.pictureApproved }</Text>
                        </View>
                    </TouchableHighlight>
                );
            }

            else {
                return (
                    <TouchableHighlight onPress={this.props.onPress}>
                        <View style={styles.li}>
                            <Image style={{width: 100, height: 125, resizeMode: Image.resizeMode.contain, borderWidth: 1, borderColor: 'red'}} source={{uri: 'data:image/png;base64,' + this.props.item.content}}/>
                            <Text
                                style={styles.liTextNotApproved}>{ this.props.item.authorDisplayName + ' checked in via photo.\nApproval status: ' + this.props.item.pictureApproved }</Text>
                        </View>
                    </TouchableHighlight>
                );
            }

        }
    }
}

module.exports = ListItem;