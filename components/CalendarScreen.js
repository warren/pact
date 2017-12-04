import React from 'react';

import { View, Text } from 'react-native';

class CalendarScreen extends React.Component {
    static navigationOptions = {
        tabBarLabel: 'Calendar',
    };

    render() {
        return(
            <View>
                <Text>bonjour mon ami</Text>
            </View>
        );
    }
}


export default CalendarScreen;