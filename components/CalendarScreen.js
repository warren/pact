import React from 'react';

import { View, Text } from 'react-native';
import { CalendarList } from 'react-native-calendars';

class CalendarScreen extends React.Component {
    static navigationOptions = {
        tabBarLabel: 'Calendar',
    };

    render() {
        return(
            <View>
                <CalendarList
                    scrollEnabled={true}
                    pastScrollRange={36}
                    futureScrollRange={36}
                ></CalendarList>
            </View>
        );
    }
}


export default CalendarScreen;