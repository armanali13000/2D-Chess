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

const BOARD_SIZE = Dimensions.get('window').width - 20;
const TILE_SIZE = BOARD_SIZE / 8;

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
};

const ChessBoard: React.FC<Props> = ({ game, setGame, isSoundOn, mode, onBack, onExitToMenu }) => {
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
      if (isSoundOn) {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/move.mp3')
        );
        setMoveSound(sound);


        const { sound: win } = await Audio.Sound.createAsync(
          require('../assets/sounds/win.mp3')
        );
        setWinSound(win);


        const { sound: check } = await Audio.Sound.createAsync(
          require('../assets/sounds/check.mp3')
        );
        setCheckSound(check);
      }
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


  const makeAIMove = async () => {
    if (mode !== '1P') return;
    if (game.isGameOver() || game.turn() !== 'b') return;

    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return;

    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    game.move(randomMove);
    setLastMove({ from: randomMove.from, to: randomMove.to });
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
            setTimeout(makeAIMove, 500);
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

  return (
  <ImageBackground
    source={require('../assets/background/b-bg.jpg')}
    style={styles.background}
    resizeMode="cover"
  >
    <View style={styles.overlay}>
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((square, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const squareColor = isLight ? '#f0d9b5' : '#b58863';
              const file = 'abcdefgh'[colIndex];
              const rank = 8 - rowIndex;
              const squareName = `${file}${rank}` as Square;
              const isLastMoveSquare = lastMove && (squareName === lastMove.from || squareName === lastMove.to);
              const isSelected = selectedSquare === squareName;
              const isValidMoveSquare = validMoves.includes(squareName);

              const tileStyle = {
                  backgroundColor: isLastMoveSquare ? '#f7ec70' : squareColor,
                };

              return (
                <TouchableOpacity
                  key={colIndex}
                  onPress={() => handleSquarePress(rowIndex, colIndex)}
                  style={[styles.tile, tileStyle]}
                >
                  {isValidMoveSquare && <View style={styles.validCircle} />}
                  {isSelected && <View style={styles.selectedCircle} />}
                  {square && (
                    <Image
                      source={pieceImages[square.color + square.type]}
                      style={styles.piece}
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
        <TouchableOpacity style={styles.button} onPress={handleUndo}>
          <Text style={styles.buttonText}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleRestart}>
          <Text style={styles.buttonText}>Restart</Text>
        </TouchableOpacity>
      </View>

      {gameOverMessage && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.trophy}>🏆</Text>
            <Text style={styles.winnerText}>{gameOverMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={onExitToMenu}>
              <Text style={styles.modalButtonText}>Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => 
                {
                  setGame(null);
                  onBack();  
                }
              } 
            >
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
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
    width: TILE_SIZE * 0.9,
    height: TILE_SIZE * 0.9,
  },
  validCircle: {
    position: 'absolute',
    width: TILE_SIZE * 0.6,
    height: TILE_SIZE * 0.6,
    borderRadius: TILE_SIZE * 0.3,
    backgroundColor: 'rgba(162, 209, 73, 0.4)',
  },
  selectedCircle: {
    position: 'absolute',
    width: TILE_SIZE * 0.8,
    height: TILE_SIZE * 0.8,
    borderRadius: TILE_SIZE * 0.4,
    backgroundColor: 'rgba(121, 194, 242, 0.4)',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
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
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#222',
  },
  modalButton: {
    backgroundColor: '#444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
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
},
trophy: {
  fontSize: 50,
  marginBottom: 10,
},

winnerText: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#FFD700', // gold color
  textAlign: 'center',
  marginBottom: 20,
},
});

export default ChessBoard;
