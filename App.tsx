import React, { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { Chess } from 'chess.js';
import ChessBoard from './components/ChessBoard';
import MenuScreen from './components/MenuScreen';
import SettingsScreen from './components/SettingsScreen';

type Screen = 'mainMenu' | 'playMenu' | 'pauseMenu' | 'game' | 'settings' | 'options';

type Mode = '1P' | '2P' | null;
export type PieceTheme = 'classic' | 'jade' | 'ruby';
export type PieceStyle = 'standard' | 'bold' | 'compact';
export type BoardTheme = 'classic' | 'ocean' | 'forest';
export type LevelType = 'easy' | 'medium' | 'hard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('mainMenu');
  const [game, setGame] = useState<Chess | null>(null);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [mode, setMode] = useState<Mode>(null);
  const [gamePaused, setGamePaused] = useState(false);
  const [pieceTheme, setPieceTheme] = useState<PieceTheme>('classic');
  const [pieceStyle, setPieceStyle] = useState<PieceStyle>('standard');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('classic');
  const [levelType, setLevelType] = useState<LevelType>('easy');

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
    BackHandler.exitApp();
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
        onOptions={() => setCurrentScreen('options')}
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
          setGame(null);
          setCurrentScreen('mainMenu');
        }}
        onExitGame={handleExit}
      />
    );
  }

  if (currentScreen === 'options') {
    return (
      <MenuScreen
        screen="options"
        pieceTheme={pieceTheme}
        setPieceTheme={setPieceTheme}
        pieceStyle={pieceStyle}
        setPieceStyle={setPieceStyle}
        boardTheme={boardTheme}
        setBoardTheme={setBoardTheme}
        levelType={levelType}
        setLevelType={setLevelType}
        onBack={() => setCurrentScreen('mainMenu')}
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
      pieceTheme={pieceTheme}
      pieceStyle={pieceStyle}
      boardTheme={boardTheme}
      levelType={levelType}
    />

    );
  }

  return <MenuScreen
  screen="main"
  onPlay={() => setCurrentScreen('playMenu')}
  onOptions={() => setCurrentScreen('options')}
  onSettings={() => setCurrentScreen('settings')}
  onExit={handleExit}
/>;
}
