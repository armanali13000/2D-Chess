import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  ScrollView,
} from 'react-native';
import type { BoardTheme, LevelType, PieceStyle, PieceTheme } from '../App';

const { width } = Dimensions.get('window');

type MenuScreenProps =
  | {
      screen: 'main';
      onPlay: () => void;
      onOptions: () => void;
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
      onExitGame: () => void;
    }
  | {
      screen: 'options';
      pieceTheme: PieceTheme;
      setPieceTheme: (value: PieceTheme) => void;
      pieceStyle: PieceStyle;
      setPieceStyle: (value: PieceStyle) => void;
      boardTheme: BoardTheme;
      setBoardTheme: (value: BoardTheme) => void;
      levelType: LevelType;
      setLevelType: (value: LevelType) => void;
      onBack: () => void;
    };

const MenuScreen: React.FC<MenuScreenProps> = (props) => {
  let title = '';
  let content: React.ReactElement | null = null;
  let scrollable = false;

  switch (props.screen) {
    case 'main':
      title = 'Air 2D Chess';
      content = (
        <>
          <MenuButton text="Play" onPress={props.onPlay} />
          <MenuButton text="Options" onPress={props.onOptions} />
          <MenuButton text="Settings" onPress={props.onSettings} />
          <MenuButton text="Exit" onPress={props.onExit} />
        </>
      );
      break;

    case 'play':
      title = 'Select Mode';
      content = (
        <>
          <MenuButton text="Play with AI" onPress={props.onPlay1P} />
          <MenuButton text="Play with Friend" onPress={props.onPlay2P} />
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
          <MenuButton text="Exit to Main Menu" onPress={props.onExit} />
          <MenuButton text="Exit Game" onPress={props.onExitGame} variant="danger" />
        </>
      );
      break;

    case 'options':
      title = 'Options';
      scrollable = true;
      content = (
        <>
          <OptionGroup
            title="Piece Colors"
            value={props.pieceTheme}
            options={[
              { label: 'Classic', value: 'classic' },
              { label: 'Jade', value: 'jade' },
              { label: 'Ruby', value: 'ruby' },
            ]}
            onChange={props.setPieceTheme}
          />
          <OptionGroup
            title="Piece Type"
            value={props.pieceStyle}
            options={[
              { label: 'Standard', value: 'standard' },
              { label: 'Bold', value: 'bold' },
              { label: 'Compact', value: 'compact' },
            ]}
            onChange={props.setPieceStyle}
          />
          <OptionGroup
            title="Board"
            value={props.boardTheme}
            options={[
              { label: 'Classic', value: 'classic' },
              { label: 'Ocean', value: 'ocean' },
              { label: 'Forest', value: 'forest' },
            ]}
            onChange={props.setBoardTheme}
          />
          <OptionGroup
            title="AI Level"
            value={props.levelType}
            options={[
              { label: 'Easy', value: 'easy' },
              { label: 'Medium', value: 'medium' },
              { label: 'Hard', value: 'hard' },
            ]}
            onChange={props.setLevelType}
          />
          <MenuButton text="Back" onPress={props.onBack} />
        </>
      );
      break;
  }

  return (
    <ImageBackground
      source={require('../assets/background/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.gameTitle}>2D Chess</Text>
        <Text style={styles.title}>{title}</Text>
        {scrollable ? (
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </View>
    </ImageBackground>
  );
};

const MenuButton = ({
  text,
  onPress,
  variant = 'primary',
}: {
  text: string;
  onPress: () => void;
  variant?: 'primary' | 'danger';
}) => (
  <TouchableOpacity
    activeOpacity={0.82}
    style={[styles.button, variant === 'danger' && styles.dangerButton]}
    onPress={onPress}
  >
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

const OptionGroup = <T extends string>({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}) => (
  <View style={styles.optionGroup}>
    <Text style={styles.optionTitle}>{title}</Text>
    <View style={styles.optionRow}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            activeOpacity={0.82}
            style={[styles.choiceButton, selected && styles.choiceButtonActive]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.choiceText, selected && styles.choiceTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8,10,16,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    color: '#f9f6ef',
    fontWeight: '700',
    marginBottom: 28,
  },
  button: {
    backgroundColor: 'rgba(20, 24, 32, 0.86)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 14,
    width: width * 0.7,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  dangerButton: {
    backgroundColor: 'rgba(120, 34, 42, 0.92)',
  },
  buttonText: {
    color: '#fffaf0',
    fontSize: 19,
    fontWeight: '700',
  },
  gameTitle: {
    position: 'absolute',
    fontSize: 48,
    color: '#fff8df',
    fontWeight: 'bold',
    top: 74,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  scrollArea: {
    width: '100%',
    maxHeight: '68%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  optionGroup: {
    width: width * 0.86,
    marginBottom: 16,
  },
  optionTitle: {
    color: '#fff8df',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 6,
  },
  choiceButtonActive: {
    backgroundColor: '#f1c45f',
    borderColor: '#ffe4a4',
  },
  choiceText: {
    color: '#f5f0e8',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  choiceTextActive: {
    color: '#171717',
  },
});

export default MenuScreen;
