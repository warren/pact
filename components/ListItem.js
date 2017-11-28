import React, {Component} from 'react';
import ReactNative from 'react-native';
const styles = require('../styles.js')
const { View, TouchableHighlight, Text } = ReactNative;

class ListItem extends Component {
    render() {
        if(this.props.item.postApproved === undefined) { {/* If the post is only text */}
            return (
                <TouchableHighlight onPress={this.props.onPress}>
                    <View style={styles.li}>
                        <Text style={styles.liText}>{this.props.item.userDisplayName + ': ' + this.props.item.title}</Text>
                    </View>
                </TouchableHighlight>
            );
        } else { {/* If the post contains a picture that has some approval value */}
            return (
                <TouchableHighlight onPress={this.props.onPress}>
                    <View style={styles.li}>
                        <Text
                            style={styles.liText}>{ this.props.item.userDisplayName + ' checked in via photo.\nApproval status: ' + this.props.item.postApproved }</Text>
                    </View>
                </TouchableHighlight>
            );
        }
    }
}

module.exports = ListItem;