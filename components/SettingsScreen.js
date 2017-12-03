import React from 'react';

import { View, Text } from 'react-native';

class SettingsScreen extends React.Component {
    static navigationOptions = {
        tabBarLabel: 'Settings',
    };

    render() {
        return(
            <View>
                <Text>bonjour mon ami</Text>
            </View>
        );
    }
}


export default SettingsScreen;