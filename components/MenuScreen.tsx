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

type MenuScreenProps =
  | {
      screen: 'main';
      onPlay: () => void;
      onSettings: () => void;
      onExit: () => void;
    }
  | {
      screen: 'play';
      onPlay1P: () => void;
      onPlay2P: () => void;
      onBack: () => void;
    }
  | {
      screen: 'pause';
      onContinue: () => void;
      onRestart: () => void;
      onSettings: () => void;
      onExit: () => void;
    };

const MenuScreen: React.FC<MenuScreenProps> = (props) => {
  let title = '';
  let content: React.ReactElement | null = null;

  switch (props.screen) {
    case 'main':
      title = 'Main Menu';
      content = (
        <>
          <MenuButton text="Play" onPress={props.onPlay} />
          <MenuButton text="Settings" onPress={props.onSettings} />
          <MenuButton text="Exit" onPress={props.onExit} />
        </>
      );
      break;

    case 'play':
      title = 'Select Mode';
      content = (
        <>
          <MenuButton text="1 Player" onPress={props.onPlay1P} />
          <MenuButton text="2 Player" onPress={props.onPlay2P} />
          <MenuButton text="Back" onPress={props.onBack} />
        </>
      );
      break;

    case 'pause':
      title = 'Game Paused';
      content = (
        <>
          <MenuButton text="Continue" onPress={props.onContinue} />
          <MenuButton text="Restart" onPress={props.onRestart} />
          <MenuButton text="Settings" onPress={props.onSettings} />
          <MenuButton text="Exit" onPress={props.onExit} />
        </>
      );
      break;
  }

  return (
    <ImageBackground
      source={require('../assets/background/background.jpg')} // 🔁 Use your own image path
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>

        <Text style={styles.gameTitle}>2D Chess</Text>

        <Text style={styles.title}>{title}</Text>
        {content}

        <Text style={styles.devText}>Developed by Arman</Text>
      </View>
    </ImageBackground>
  );
};

const MenuButton = ({ text, onPress }: { text: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // ✨ Semi-transparent overlay
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
  gameTitle: {
    position: 'absolute',
    fontSize: 56,
    color: '#fff',
    fontWeight: 'bold',
    top: 120,
    marginBottom: 20,
  },
  devText: {
    position: 'absolute',
    bottom: 30,
    fontSize: 16,
    color: 'white',
    opacity: 0.7,
  },
});

export default MenuScreen;
