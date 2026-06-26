import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  ImageBackground,
} from 'react-native';
import { Chess, Square } from 'chess.js';
import { Audio } from 'expo-av';
import type { BoardTheme, LevelType, PieceStyle, PieceTheme } from '../App';

const BOARD_SIZE = Dimensions.get('window').width - 20;
const TILE_SIZE = BOARD_SIZE / 8;

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

const BOARD_THEMES: Record<BoardTheme, { light: string; dark: string; last: string }> = {
  classic: { light: '#f0d9b5', dark: '#b58863', last: '#f7ec70' },
  ocean: { light: '#c7e4ef', dark: '#4f8fa8', last: '#ffe377' },
  forest: { light: '#d8d2ad', dark: '#6c8a55', last: '#f6cf66' },
};

const PIECE_THEMES: Record<PieceTheme, { white?: string; black?: string }> = {
  classic: {},
  jade: { white: '#eafff5', black: '#185b47' },
  ruby: { white: '#fff0ec', black: '#6e1f2a' },
};

const PIECE_STYLES: Record<PieceStyle, { scale: number; opacity: number }> = {
  standard: { scale: 0.9, opacity: 1 },
  bold: { scale: 0.98, opacity: 1 },
  compact: { scale: 0.78, opacity: 0.96 },
};

const pieceImages: { [key: string]: any } = {
  bp: require('../assets/pieces/black-pawn.png'),
  br: require('../assets/pieces/black-rook.png'),
  bn: require('../assets/pieces/black-knight.png'),
  bb: require('../assets/pieces/black-bishop.png'),
  bq: require('../assets/pieces/black-queen.png'),
  bk: require('../assets/pieces/black-king.png'),
  wp: require('../assets/pieces/white-pawn.png'),
  wr: require('../assets/pieces/white-rook.png'),
  wn: require('../assets/pieces/white-knight.png'),
  wb: require('../assets/pieces/white-bishop.png'),
  wq: require('../assets/pieces/white-queen.png'),
  wk: require('../assets/pieces/white-king.png'),
};

type Props = {
  game: Chess;
  setGame: React.Dispatch<React.SetStateAction<Chess | null>>;
  isSoundOn: boolean;
  mode: '1P' | '2P';
  onBack: () => void;
  onExitToMenu: () => void;
  pieceTheme: PieceTheme;
  pieceStyle: PieceStyle;
  boardTheme: BoardTheme;
  levelType: LevelType;
};

const ChessBoard: React.FC<Props> = ({
  game,
  setGame,
  isSoundOn,
  mode,
  onBack,
  onExitToMenu,
  pieceTheme,
  pieceStyle,
  boardTheme,
  levelType,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [board, setBoard] = useState(game.board());
  const [moveSound, setMoveSound] = useState<Audio.Sound | null>(null);
  const [winSound, setWinSound] = useState<Audio.Sound | null>(null);
  const [checkSound, setCheckSound] = useState<Audio.Sound | null>(null);
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  useEffect(() => {
    const loadSound = async () => {
      if (!isSoundOn) return;

      const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/move.mp3'));
      setMoveSound(sound);

      const { sound: win } = await Audio.Sound.createAsync(require('../assets/sounds/win.mp3'));
      setWinSound(win);

      const { sound: check } = await Audio.Sound.createAsync(require('../assets/sounds/check.mp3'));
      setCheckSound(check);
    };

    loadSound();

    return () => {
      moveSound?.unloadAsync();
      winSound?.unloadAsync();
      checkSound?.unloadAsync();
    };
  }, [isSoundOn]);

  const playCheckSound = async () => {
    if (isSoundOn && checkSound) {
      await checkSound.replayAsync();
    }
  };

  const playMoveSound = async () => {
    if (isSoundOn && moveSound) {
      await moveSound.replayAsync();
    }
  };

  const handleUndo = () => {
    game.undo();
    if (mode === '1P') {
      game.undo();
    }
    setBoard(game.board());
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
  };

  const handleRestart = () => {
    const newGame = new Chess();
    setGame(newGame);
    setBoard(newGame.board());
    setSelectedSquare(null);
    setValidMoves([]);
    setGameOverMessage(null);
    setLastMove(null);
  };

  const checkGameOver = async () => {
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Black' : 'White';
      setGameOverMessage(`${winner} wins by checkmate!`);
      if (isSoundOn && winSound) await winSound.replayAsync();
    } else if (game.isStalemate()) {
      setGameOverMessage('Draw by stalemate!');
      if (isSoundOn && winSound) await winSound.replayAsync();
    } else if (game.isDraw()) {
      setGameOverMessage('Draw!');
      if (isSoundOn && winSound) await winSound.replayAsync();
    }
  };

  const scoreMove = (move: any) => {
    let score = move.captured ? PIECE_VALUES[move.captured] - PIECE_VALUES[move.piece] * 0.08 : 0;
    const preview = new Chess(game.fen());
    preview.move(move);

    if (preview.isCheckmate()) {
      score += 100000;
    } else if (preview.inCheck()) {
      score += 80;
    }

    if (levelType === 'hard') {
      const replies = preview.moves({ verbose: true });
      const strongestReply = replies.reduce((best: number, reply: any) => {
        const replyScore = reply.captured ? PIECE_VALUES[reply.captured] : 0;
        return Math.max(best, replyScore);
      }, 0);
      score -= strongestReply * 0.55;
    }

    return score + Math.random() * 4;
  };

  const chooseAIMove = () => {
    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return null;

    if (levelType === 'easy') {
      return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    const sortedMoves = [...possibleMoves].sort((a, b) => scoreMove(b) - scoreMove(a));
    if (levelType === 'medium') {
      return sortedMoves[Math.floor(Math.random() * Math.min(3, sortedMoves.length))];
    }

    return sortedMoves[0];
  };

  const makeAIMove = async () => {
    if (mode !== '1P') return;
    if (game.isGameOver() || game.turn() !== 'b') return;

    const aiMove = chooseAIMove();
    if (!aiMove) return;

    game.move(aiMove);
    setLastMove({ from: aiMove.from, to: aiMove.to });
    setBoard(game.board());
    await playMoveSound();

    if (game.inCheck()) {
      await playCheckSound();
    }

    checkGameOver();
  };

  const handleSquarePress = async (row: number, col: number) => {
    const file = 'abcdefgh'[col];
    const rank = 8 - row;
    const square = `${file}${rank}` as Square;

    if (mode === '1P' && game.turn() === 'b') return;

    if (selectedSquare) {
      if (validMoves.includes(square)) {
        const move = game.move({ from: selectedSquare, to: square, promotion: 'q' });

        if (move) {
          setBoard(game.board());
          setLastMove({ from: move.from, to: move.to });
          await playMoveSound();

          if (game.inCheck()) {
            await playCheckSound();
          }
          checkGameOver();
          setSelectedSquare(null);
          setValidMoves([]);

          if (mode === '1P') {
            setTimeout(makeAIMove, 420);
          }
        }
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        const targets = moves.map((m) => m.to as Square);
        setValidMoves(targets);
      }
    }
  };

  const theme = BOARD_THEMES[boardTheme];
  const pieceLook = PIECE_STYLES[pieceStyle];

  return (
    <ImageBackground
      source={require('../assets/background/b-bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>{mode === '1P' ? `AI: ${levelType}` : 'Friend Match'}</Text>
          <Text style={styles.statusText}>{game.turn() === 'w' ? 'White' : 'Black'} to move</Text>
        </View>

        <View style={styles.board}>
          {board.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((square, colIndex) => {
                const isLight = (rowIndex + colIndex) % 2 === 0;
                const file = 'abcdefgh'[colIndex];
                const rank = 8 - rowIndex;
                const squareName = `${file}${rank}` as Square;
                const isLastMoveSquare =
                  lastMove && (squareName === lastMove.from || squareName === lastMove.to);
                const isSelected = selectedSquare === squareName;
                const isValidMoveSquare = validMoves.includes(squareName);
                const pieceTint = square
                  ? PIECE_THEMES[pieceTheme][square.color === 'w' ? 'white' : 'black']
                  : undefined;

                return (
                  <TouchableOpacity
                    key={colIndex}
                    activeOpacity={0.86}
                    onPress={() => handleSquarePress(rowIndex, colIndex)}
                    style={[
                      styles.tile,
                      { backgroundColor: isLastMoveSquare ? theme.last : isLight ? theme.light : theme.dark },
                    ]}
                  >
                    {isValidMoveSquare && <View style={styles.validCircle} />}
                    {isSelected && <View style={styles.selectedCircle} />}
                    {square && (
                      <Image
                        source={pieceImages[square.color + square.type]}
                        style={[
                          styles.piece,
                          {
                            width: TILE_SIZE * pieceLook.scale,
                            height: TILE_SIZE * pieceLook.scale,
                            opacity: pieceLook.opacity,
                            tintColor: pieceTint,
                          },
                        ]}
                        resizeMode="contain"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity activeOpacity={0.82} style={styles.button} onPress={handleUndo}>
            <Text style={styles.buttonText}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.82} style={styles.button} onPress={handleRestart}>
            <Text style={styles.buttonText}>Restart</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.82} style={styles.button} onPress={onBack}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        </View>

        {gameOverMessage && (
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.winnerText}>{gameOverMessage}</Text>
              <TouchableOpacity activeOpacity={0.82} style={styles.modalButton} onPress={handleRestart}>
                <Text style={styles.modalButtonText}>Restart</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.82} style={styles.modalButton} onPress={onExitToMenu}>
                <Text style={styles.modalButtonText}>Exit to Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  piece: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.32,
    shadowRadius: 4,
  },
  validCircle: {
    position: 'absolute',
    width: TILE_SIZE * 0.42,
    height: TILE_SIZE * 0.42,
    borderRadius: TILE_SIZE * 0.21,
    backgroundColor: 'rgba(55, 150, 68, 0.42)',
  },
  selectedCircle: {
    position: 'absolute',
    width: TILE_SIZE * 0.82,
    height: TILE_SIZE * 0.82,
    borderRadius: TILE_SIZE * 0.41,
    backgroundColor: 'rgba(74, 144, 226, 0.36)',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  button: {
    backgroundColor: 'rgba(20, 24, 32, 0.88)',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
    marginHorizontal: 5,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  buttonText: {
    color: '#fffaf0',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fffaf0',
    padding: 26,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#242832',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.24)',
    paddingHorizontal: 10,
  },
  statusBar: {
    width: BOARD_SIZE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20, 24, 32, 0.82)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  statusText: {
    color: '#fffaf0',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  winnerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#242832',
    textAlign: 'center',
    marginBottom: 18,
  },
});

export default ChessBoard;
