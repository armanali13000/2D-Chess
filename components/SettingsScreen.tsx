import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  ScrollView,
} from 'react-native';

const { width } = Dimensions.get('window');
const APP_VERSION = '2.0.0';

type Props = {
  isSoundOn: boolean;
  setIsSoundOn: (value: boolean) => void;
  onBack: () => void;
};

const SettingsScreen: React.FC<Props> = ({ isSoundOn, setIsSoundOn, onBack }) => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  if (showPrivacyPolicy) {
    return (
      <ImageBackground
        source={require('../assets/background/setting-background.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Privacy Policy</Text>

          <ScrollView
            style={styles.privacyPanel}
            contentContainerStyle={styles.privacyContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.policyHeading}>Air 2D Chess Privacy Policy</Text>
            <Text style={styles.policyText}>
              Air 2D Chess is designed as an offline chess game. The app does not collect,
              sell, or share personal information.
            </Text>
            <Text style={styles.policyHeading}>Game Data</Text>
            <Text style={styles.policyText}>
              Settings such as sound, board style, piece options, and level type are used only
              inside the app to improve your playing experience.
            </Text>
            <Text style={styles.policyHeading}>Permissions</Text>
            <Text style={styles.policyText}>
              If Android asks for any permission, it is used only for app features and device
              compatibility. Air 2D Chess does not use permissions to track you.
            </Text>
            <Text style={styles.policyHeading}>Children Privacy</Text>
            <Text style={styles.policyText}>
              The game is suitable for general audiences and does not knowingly collect data
              from children.
            </Text>
            <Text style={styles.policyHeading}>Contact</Text>
            <Text style={styles.policyText}>
              For privacy questions, contact the developer listed in the app store page.
            </Text>
          </ScrollView>

          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.button}
            onPress={() => setShowPrivacyPolicy(false)}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/background/setting-background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sound</Text>
          <TouchableOpacity
            activeOpacity={0.82}
            style={[styles.toggle, isSoundOn && styles.toggleOn]}
            onPress={() => setIsSoundOn(!isSoundOn)}
          >
            <View style={[styles.toggleKnob, isSoundOn && styles.toggleKnobOn]} />
            <Text style={[styles.toggleText, isSoundOn && styles.toggleTextOn]}>
              {isSoundOn ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.button}
          onPress={() => setShowPrivacyPolicy(true)}
        >
          <Text style={styles.buttonText}>Privacy Policy</Text>
        </TouchableOpacity>

        <View style={styles.infoPanel}>
          <Text style={styles.infoText}>Developed by Arman</Text>
          <Text style={styles.infoText}>Version {APP_VERSION}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.82} style={styles.button} onPress={onBack}>
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
    backgroundColor: 'rgba(7, 10, 14, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    color: '#fff8df',
    fontWeight: '800',
    marginBottom: 32,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  button: {
    backgroundColor: 'rgba(20, 24, 32, 0.88)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 14,
    width: width * 0.72,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  settingRow: {
    width: width * 0.72,
    minHeight: 58,
    backgroundColor: 'rgba(20, 24, 32, 0.88)',
    borderRadius: 8,
    marginBottom: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  settingLabel: {
    color: '#fffaf0',
    fontSize: 19,
    fontWeight: '700',
  },
  toggle: {
    width: 86,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  toggleOn: {
    backgroundColor: '#f1c45f',
    borderColor: '#ffe4a4',
  },
  toggleKnob: {
    position: 'absolute',
    left: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f9f6ef',
  },
  toggleKnobOn: {
    left: 51,
    backgroundColor: '#171717',
  },
  toggleText: {
    color: '#fffaf0',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    paddingRight: 8,
  },
  toggleTextOn: {
    color: '#171717',
    textAlign: 'left',
    paddingLeft: 8,
    paddingRight: 0,
  },
  buttonText: {
    color: '#fffaf0',
    fontSize: 19,
    fontWeight: '700',
  },
  infoPanel: {
    width: width * 0.72,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  infoText: {
    color: '#f9f6ef',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 2,
  },
  privacyPanel: {
    width: width * 0.84,
    maxHeight: '62%',
    backgroundColor: 'rgba(20, 24, 32, 0.88)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginBottom: 18,
  },
  privacyContent: {
    padding: 18,
  },
  policyHeading: {
    color: '#fff8df',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
    marginTop: 8,
  },
  policyText: {
    color: '#f9f6ef',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 8,
  },
});

export default SettingsScreen;
