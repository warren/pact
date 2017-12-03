import React, {Component} from 'react';
import ReactNative, { Alert } from 'react-native';
const styles = require('../styles.js')
const { View, TouchableHighlight, Text } = ReactNative;

class ListItem extends Component {
    render() {
        if (this.props.item.authorID !== this.props.item.pairID &&
            this.props.item.authorID !== this.props.item.userID &&
            this.props.item.authorID !== '-1') /* ID of -1 is a system message, and is always shown */
        {
            return(
                <TouchableHighlight onPress={this.props.onPress}>
                    <View style={styles.li}>
                        <Text style={styles.liText}>Someone else posted</Text>
                    </View>
                </TouchableHighlight>
            ); /* Do nothing */
        }

        else {
            if (this.props.item.postApproved === undefined) { /* If the post is only text */
                return (
                    <TouchableHighlight onPress={this.props.onPress}>
                        <View style={styles.li}>
                            <Text style={styles.liText}>{this.props.item.authorDisplayName + ': ' + this.props.item.title}</Text>
                        </View>
                    </TouchableHighlight>
                );
            }

            else { /* If the post contains an approval value then it must be a picture */
                if (this.props.item.authorID === this.props.item.pairID) { /* If the post was made by the user's pair */
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
                                <Text
                                    style={styles.liTextNotApproved}>{ this.props.item.authorDisplayName + ' checked in via photo.\nApproval status: ' + this.props.item.postApproved }</Text>
                            </View>
                        </TouchableHighlight>
                    );
                }

                else {
                    return (
                        <TouchableHighlight onPress={this.props.onPress}>
                            <View style={styles.li}>
                                <Text
                                    style={styles.liTextNotApproved}>{ this.props.item.authorDisplayName + ' checked in via photo.\nApproval status: ' + this.props.item.postApproved }</Text>
                            </View>
                        </TouchableHighlight>
                    );
                }

            }
        }
    }
}

module.exports = ListItem;