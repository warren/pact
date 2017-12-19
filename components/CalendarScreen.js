import React from 'react';

import { View, Text } from 'react-native';
import { CalendarList } from 'react-native-calendars';

class CalendarScreen extends React.Component {
    static navigationOptions = {
        tabBarLabel: 'Progress',
    };

    render() {
        const workout = {key:'workout', color: 'blue'};
        return(
            <View>
                <CalendarList
                    scrollEnabled={true}
                    pastScrollRange={36}
                    futureScrollRange={36}
                    markedDates={{
                        '2017-12-01': {selected: true},
                        '2017-12-02': {selected: true},
                        '2017-12-03': {disabled: true},
                        '2017-12-04': {selected: true},
                        '2017-12-08': {selected: true},
                        '2017-12-12': {selected: true},
                        '2017-12-14': {selected: true},
                        '2017-12-15': {disabled: true},
                        '2017-12-16': {selected: true},
                        '2017-12-18': {selected: true},
                        '2017-12-20': {dots: [workout]},
                        '2017-12-22': {dots: [workout]},
                        '2017-12-24': {dots: [workout]},
                        '2017-12-27': {dots: [workout]},
                        '2017-12-30': {dots: [workout]},
                        '2017-12-31': {dots: [workout]},
                        '2018-01-01': {dots: [workout]},
                    }}
                    markingType={'multi-dot'}
                    onDayPress={(day) => {console.log(day)}}
                />
            </View>
        );
    }
}


export default CalendarScreen;