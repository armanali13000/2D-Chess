import React, { useState, useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { Chess } from 'chess.js';
import ChessBoard from './components/ChessBoard';
import MenuScreen from './components/MenuScreen';
import SettingsScreen from './components/SettingsScreen';

type Screen = 'mainMenu' | 'playMenu' | 'pauseMenu' | 'game' | 'settings';

type Mode = '1P' | '2P' | null;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('mainMenu');
  const [game, setGame] = useState<Chess | null>(null);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [mode, setMode] = useState<Mode>(null);
  const [gamePaused, setGamePaused] = useState(false);

  // Handle back button to pause game
  useEffect(() => {
    const backAction = () => {
      if (currentScreen === 'game') {
        setGamePaused(true);
        setCurrentScreen('pauseMenu');
        return true; // prevent default behavior
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [currentScreen]);

  const startGame = (selectedMode: Mode) => {
    setMode(selectedMode);
    setGame(new Chess());
    setGamePaused(false);
    setCurrentScreen('game');
  };

  const handleExit = () => {
    Alert.alert('Exit Game', 'Are you sure you want to exit?', [
      { text: 'Cancel' },
      { text: 'Exit', onPress: () => BackHandler.exitApp() },
    ]);
  };

  const handleRestart = () => {
    setGame(new Chess());
    setCurrentScreen('game');
    setGamePaused(false);
  };

  // =================== Screen Control ===================

  if (currentScreen === 'mainMenu') {
    return (
      <MenuScreen
        screen="main"
        onPlay={() => setCurrentScreen('playMenu')}
        onSettings={() => setCurrentScreen('settings')}
        onExit={handleExit}
      />
    );
  }

  if (currentScreen === 'playMenu') {
    return (
      <MenuScreen
        screen="play"
        onPlay1P={() => startGame('1P')}
        onPlay2P={() => startGame('2P')}
        onBack={() => setCurrentScreen('mainMenu')}
      />
    );
  }

  if (currentScreen === 'pauseMenu') {
    return (
      <MenuScreen
        screen="pause"
        onContinue={() => setCurrentScreen('game')}
        onRestart={handleRestart}
        onSettings={() => setCurrentScreen('settings')}
        onExit={() => {
          setGamePaused(false);
          setMode(null);
          setCurrentScreen('mainMenu');
        }}
      />
    );
  }

  if (currentScreen === 'settings') {
    return (
      <SettingsScreen
        isSoundOn={isSoundOn}
        setIsSoundOn={setIsSoundOn}
        onBack={() => {
          if (gamePaused) {
            setCurrentScreen('pauseMenu');
          } else {
            setCurrentScreen('mainMenu');
          }
        }}
      />
    );
  }

  if (currentScreen === 'game' && game) {
    return (
      <ChessBoard
      game={game}
      setGame={setGame}
      onBack={() => {
        setGamePaused(true);
        setCurrentScreen('pauseMenu');
      }}
      onExitToMenu={() => {
        setGame(null);
        setMode(null);
        setGamePaused(false);
        setCurrentScreen('mainMenu');
      }}
      isSoundOn={isSoundOn}
      mode={mode!}
    />

    );
  }

  return <MenuScreen
  screen="main"
  onPlay={() => setCurrentScreen('playMenu')}
  onSettings={() => setCurrentScreen('settings')}
  onExit={handleExit}
/>;
}
