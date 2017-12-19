import React from 'react';

import { View, Text, Image, Button, TouchableOpacity } from 'react-native';

class SettingsScreen extends React.Component {
    static navigationOptions = {
        tabBarLabel: 'Settings',
    };

    render() {
        return(
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text/>
                <Text style={{fontWeight: 'bold', fontSize: 30}}>Your settings</Text>
                <Text style={{fontSize: 15}}>What times per week will you work out? Remember, only your partner may change these settings from now on.</Text>
                <Text style={{fontSize: 15}}/>
                <TouchableOpacity onPress={() => {console.log("Self settings pressed")}} >
                    <Image source={require('../resources/mocksegmentedcontrol.png')}/>
                </TouchableOpacity>
                <Text style={{fontSize: 60}}/>

                <Text style={{fontSize: 85}}> </Text>
                <Text style={{fontWeight: 'bold', fontSize: 30}}>Your partner's settings</Text>
                <Text style={{fontSize: 15}}>What times per week will they work out?</Text>
                <Text style={{fontSize: 15}}/>
                <TouchableOpacity onPress={() => {console.log("Partner settings pressed")}} >
                    <Image source={require('../resources/mocksegmentedcontrol.png')}/>
                </TouchableOpacity>
            </View>
        );
    }
}


export default SettingsScreen;