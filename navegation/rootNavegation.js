import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import StackNavigator from './StackNavigator';
import AppTabs from '../pacientes/(tabs)/tabNavegation';

const RootStack = createStackNavigator();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Auth" component={StackNavigator} />
        <RootStack.Screen name="App" component={AppTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
