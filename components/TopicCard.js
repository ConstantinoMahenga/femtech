import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const TopicCard = ({ topic, onPress, onDetailsPress }) => {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (topic.isExpanded) {
      Animated.parallel([
        Animated.timing(heightAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(heightAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        })
      ]).start();
    }
  }, [topic.isExpanded]);

  const contentHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100] // Ajuste este valor conforme necessário
  });

  const contentOpacity = opacityAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.9}
        style={styles.headerButton}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{topic.title}</Text>
          <Animated.View style={{
            transform: [{
              rotate: heightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg']
              })
            }]
          }}>
            <Icon 
              name="chevron-down" 
              size={20} 
              color="#E83E8C" 
            />
          </Animated.View>
        </View>
      </TouchableOpacity>
      
      <Animated.View style={{
        height: contentHeight,
        opacity: contentOpacity,
        overflow: 'hidden'
      }}>
        <View style={styles.content}>
          <Text style={styles.description}>{topic.description}</Text>
          <TouchableOpacity 
            onPress={onDetailsPress} 
            style={styles.button}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Saber mais</Text>
            <Icon name="arrow-right" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  headerButton: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E83E8C',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default TopicCard;