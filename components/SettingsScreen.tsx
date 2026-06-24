import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';

const { width } = Dimensions.get('window');

type Props = {
  isSoundOn: boolean;
  setIsSoundOn: (value: boolean) => void;
  onBack: () => void;
};

const SettingsScreen: React.FC<Props> = ({ isSoundOn, setIsSoundOn, onBack }) => {
  return (
    <ImageBackground
      source={require('../assets/background/setting-background.jpg')} // Replace with your image path
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Settings</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setIsSoundOn(!isSoundOn)}
        >
          <Text style={styles.buttonText}>
            Sound: {isSoundOn ? 'ON 🔊' : 'OFF 🔇'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    color: 'white',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#444',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 20,
    width: width * 0.7,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});

export default SettingsScreen;
