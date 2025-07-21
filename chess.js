// todo: add isCheck logic

// Configs for the chessboard
let width = document.documentElement.clientWidth
if (width > 1000) width = 1000
const canvasSize = 100 * parseInt(width / 100) - 30
const squareSize = canvasSize / 8
const fontSmall = canvasSize / 50
const fontLarge = canvasSize / 25

// Variables
let gameEnded = false
let lastClick = null
let selectedPiecePos = false
let selectedPiece = false // Selected piece from click
let selectedSlot = null // Selected chess slot from click
let pieces = [] // Pieces array
let allowedMoves = [] // Array to store the allowed moves
let allowedTakes = [] // Array to store the allowed takes
let TURN = false // false = WHITE | true = BLACK
let logs = [] // Array to store the logs of plays
let showLogs = true // Show logs in the DOM
let showNotation = false // Show algebraic notation on the board
let showHighlights = true // Show highlights for allowed moves and takes

// Setup function from p5.js
function setup() {
  const canvas = createCanvas(canvasSize, canvasSize).parent('chess-board')
  textFont("Calibri")
  createPieces()
}

// Draw function from p5.js
function draw() {
  drawBoard()
  for (const piece of pieces) {
    piece.selfDraw()
  }
  if (selectedPiecePos != false && !gameEnded) {
    highlightSpot(selectedPiecePos.spot)
    checkPieceMoves(selectedPiece)

    if (showHighlights) {
      for (const move of allowedMoves) {
        highlightSpot(move)
      }
      for (const take of allowedTakes) {
        highlightTake(take.position)
      }
    }
  }
}

function drawBoard() {
  let color = false
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (color) {
        fill(25)
      } else {
        fill(220)
      }
      color = !color
      rect(j * squareSize, i * squareSize, squareSize, squareSize)
      fill(200, 50, 50)

      textSize(fontSmall)
      if (showNotation) text(convertToLetter(j + 1) + ' ' + (9 - (i + 1)), j * squareSize + 2, i * squareSize + (squareSize - 2))
    }
    color = !color
  }
}

function createPieces() {
  // Create pawns
  for (let i = 0; i < 8; i++) {
    pieces.push(new Piece('P', i + 1, 2, false));
    pieces.push(new Piece('P', i + 1, 7, true));
  }

  // Create towers
  pieces.push(new Piece('T', 1, 8, true));
  pieces.push(new Piece('T', 8, 8, true));
  pieces.push(new Piece('T', 8, 1, false));
  pieces.push(new Piece('T', 1, 1, false));

  // Create horses
  pieces.push(new Piece('H', 2, 8, true));
  pieces.push(new Piece('H', 7, 8, true));
  pieces.push(new Piece('H', 7, 1, false));
  pieces.push(new Piece('H', 2, 1, false));

  // Create bishops
  pieces.push(new Piece('B', 3, 8, true));
  pieces.push(new Piece('B', 6, 8, true));
  pieces.push(new Piece('B', 6, 1, false));
  pieces.push(new Piece('B', 3, 1, false));

  // Create kings and queens
  pieces.push(new Piece('K', 4, 8, true));
  pieces.push(new Piece('Q', 5, 8, true));
  pieces.push(new Piece('K', 4, 1, false));
  pieces.push(new Piece('Q', 5, 1, false));
}

function checkPieceMoves(piece) {
  allowedMoves = []
  allowedTakes = []

  switch (piece.type) {
    case 'P':
      checkPawnMoves(piece)
      break

    case 'T':
      checkTowerMoves(piece)
      break

    case 'H':
      checkHorseMoves(piece)
      break

    case 'B':
      checkBishopMoves(piece)
      break

    case 'Q':
      checkTowerMoves(piece)
      checkBishopMoves(piece)
      break

    case 'K':
      checkTowerMoves(piece, true)
      checkBishopMoves(piece, true)
      break

    default:
      break
  }
}

function checkBishopMoves(piece, isKing) {
  const possibleDirections = [
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 }
  ]

  for (const direction of possibleDirections) {
    let x = piece.position.x
    let y = piece.position.y

    while (true) {
      // Check next diagonal until out of board or until find an allowedTake
      x += direction.x
      y += direction.y

      if (x < 1 || x > 8 || y < 1 || y > 8) break; // Out of board

      const isPiece = checkPiece(x, y)
      if (isPiece == false) {
        allowedMoves.push(convertToLetter(x) + y) // No piece
        if (isKing) break; // If king stop checking further
      } else {
        if (isPiece.color !== piece.color) {
          allowedTakes.push(isPiece) // Found piece to take
          if (isKing) break; // If king stop checking further
        }
        break; // Stop checking further in this direction
      }
    }
  }
}

function checkTowerMoves(piece, isKing) {
  const possibleDirections = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ]

  for (const direction of possibleDirections) {
    let x = piece.position.x
    let y = piece.position.y

    while (true) {
      // Check next position until out of board or until find an allowedTake
      x += direction.x
      y += direction.y

      if (x < 1 || x > 8 || y < 1 || y > 8) break; // Out of board

      const isPiece = checkPiece(x, y)
      if (isPiece == false) {
        allowedMoves.push(convertToLetter(x) + y) // No piece
        if (isKing) break; // If king stop checking further
      } else {
        if (isPiece.color !== piece.color) {
          allowedTakes.push(isPiece) // Found piece to take
          if (isKing) break; // If king stop checking further
        }
        break; // Stop checking further in this direction
      }
    }
  }
}

function checkHorseMoves(piece) {
  const possibleHorseMoves = [
    { x: 1, y: 2 },
    { x: 2, y: 1 },
    { x: -1, y: 2 },
    { x: -2, y: 1 },
    { x: 1, y: -2 },
    { x: 2, y: -1 },
    { x: -1, y: -2 },
    { x: -2, y: -1 }
  ]
  for (const move of possibleHorseMoves) {
    const newX = piece.position.x + move.x
    const newY = piece.position.y + move.y
    // 
    if (newX >= 1 && newX <= 8 && newY >= 1 && newY <= 8) {
      const isPiece = checkPiece(newX, newY)
      if (isPiece == false) {
        allowedMoves.push(convertToLetter(newX) + newY)
      } else {
        if (isPiece.color !== piece.color) {
          allowedTakes.push(isPiece)
        }
      }
    }
  }
}

function checkPawnMoves(piece) {
  const moveDirection = piece.color ? -1 : 1; // -1 for black, 1 for white
  const move2x = moveDirection * 2;

  // Check foward to MOVE
  let isPiece0 = checkPiece(selectedPiece.position.x, selectedPiece.position.y + moveDirection)
  if (isPiece0 == false) {
    allowedMoves.push(convertToLetter(selectedPiece.position.x) + (selectedPiece.position.y + moveDirection))

    // Check possibility to move 2x forward on first pawn play
    if (selectedPiece.moved == false) {
      if (checkPiece(selectedPiece.position.x, selectedPiece.position.y + move2x) == false) {
        allowedMoves.push(convertToLetter(selectedPiece.position.x) + (selectedPiece.position.y + move2x))
      }
    }
  }

  // Check diagonals for takes
  let isPiece1 = checkPiece(selectedPiece.position.x + 1, selectedPiece.position.y + moveDirection)
  let isPiece2 = checkPiece(selectedPiece.position.x - 1, selectedPiece.position.y + moveDirection)
  if (isPiece1 !== false) {
    if (isPiece1.color !== TURN) {
      allowedTakes.push(isPiece1)
    }
  }
  if (isPiece2 !== false) {
    if (isPiece2.color !== TURN) {
      allowedTakes.push(isPiece2)
    }
  }

  // TODO: if reach end of board, promote to QUEEN (tower, horse or bishop)
}

function checkPiece(x, y) {
  for (const piece of pieces) {
    if (piece.position.x == x && piece.position.y == y) {
      return piece
    }
  }
  return false
}

function checkTake(move) {
  // todo: add isCheck logic
  const xy = convertSpot(move)
  const isPiece = checkPiece(xy.x, xy.y)
  if (isPiece.color == TURN) return false
  if (isPiece !== false) return isPiece
  return false
}

function takePiece(x, y) {
  for (let i = pieces.length - 1; i >= 0; i--) {
    if (pieces[i].position.x == x && pieces[i].position.y == y) {
      // Check if piece is King
      if (pieces[i].type == 'K') {
        gameEnded = true
        document.getElementById('turn').innerHTML = `Game Over. ${dictionaryLog(selectedPiece.color)} WINS!`
      }
      pieces.splice(i, 1)
      return
    }
  }
}

function highlightTake(spot) {
  fill(255, 30, 30, 100)
  rect(spot.x * squareSize - squareSize, canvasSize - squareSize * spot.y, squareSize)
}

function highlightSpot(spot) {
  spot = convertSpot(spot)
  fill(30, 255, 30, 100)
  rect(spot.x * squareSize - squareSize, canvasSize - squareSize * spot.y, squareSize)
}

function convertSpot(s) {
  let x = s.substring(0, 1)
  x = convertToNumber(x)
  let y = parseInt(s.substring(1))
  return { x: x, y: y }
}

function convertToLetter(number) {
  switch (number) {
    case 1:
      return 'A'
      break;
    case 2:
      return 'B'
      break;
    case 3:
      return 'C'
      break;
    case 4:
      return 'D'
      break;
    case 5:
      return 'E'
      break;
    case 6:
      return 'F'
      break;
    case 7:
      return 'G'
      break;
    case 8:
      return 'H'
      break;
    default:
      break;
  }
}

function convertToNumber(letter) {
  switch (letter) {
    case 'A':
      return 1
      break
    case 'B':
      return 2
      break
    case 'C':
      return 3
      break
    case 'D':
      return 4
      break
    case 'E':
      return 5
      break
    case 'F':
      return 6
      break;
    case 'G':
      return 7
      break
    case 'H':
      return 8
      break
    default:
      break
  }
}

function resetVariables() {
  selectedPiece = false
  selectedPiecePos = false
  allowedMoves = []
  allowedTakes = []
}

function restartGame() {
  lastClick = null
  selectedSlot = null
  TURN = false
  pieces = []
  resetVariables()
  createPieces()
  logs = []
  showPlays()
  gameEnded = false
  document.getElementById('turn').innerHTML = 'WHITE TURN'
}

function turnDomChange() {
  const turnDom = document.getElementById('turn')
  if (TURN) {
    turnDom.innerHTML = 'BLACK TURN'
  } else {
    turnDom.innerHTML = 'WHITE TURN'
  }
  document.getElementsByTagName('body')[0].classList.toggle('white')
  document.getElementsByTagName('body')[0].classList.toggle('black')
}

function dictionaryLog(word) {
  switch (word) {
    case 'P':
      return 'Pawn'
      break;
    case 'T':
      return 'Tower'
      break;
    case 'H':
      return 'Horse'
      break;
    case 'B':
      return 'Bishop'
      break;
    case 'Q':
      return 'Queen'
      break;
    case 'K':
      return 'King'
      break;
    case false:
      return 'White'
      break;
    case true:
      return 'Black'
      break;
    default:
      break;
  }
}

function genLog(txt, color, isTake) {
  const colorText = color ? 'black' : 'white'
  logs.push({ text: txt, color: colorText, isTake: isTake })
  showPlays()
}

function showPlays() {
  let isTake = '';
  if (showLogs) {
    let html = ''
    for (const log of logs) {
      if (log.isTake) isTake = 'take'
      else isTake = ''
      html += `<p class="${log.color}-p ${isTake}">${log.text}</p>`
    }
    document.getElementById('plays').innerHTML = html
  } else {
    document.getElementById('plays').innerHTML = ''
  }
}

// Function to handle mouse clicks inside the chessboard
// Changed from mouseClicked() to touchStarted()
function touchStarted() {
  if (gameEnded) return // If game ended, do not allow further moves
  if (mouseX >= 0 && mouseX <= canvasSize && mouseY >= 0 && mouseY <= canvasSize) {
    const x = parseInt(mouseX / squareSize) + 1
    const y = (7 - parseInt(mouseY / squareSize)) + 1
    const pos = convertToLetter(x) + y
    let isMove = false
    lastClick = { x: x, y: y, spot: pos }

    // Piece take check
    for (let i = allowedTakes.length - 1; i >= 0; i--) {
      if (allowedTakes[i].position.x == lastClick.x && allowedTakes[i].position.y == lastClick.y) {
        takePiece(lastClick.x, lastClick.y)
        isMove = true;
        genLog(`${dictionaryLog(selectedPiece.color)} ${dictionaryLog(selectedPiece.type)} at ${selectedPiecePos.spot} took ${dictionaryLog(allowedTakes[i].type)} at ${pos}`,
          selectedPiece.color,
          true)
      }
    }

    // Piece move check
    if (allowedMoves.length > 0) {
      if (allowedMoves.includes(pos) == true) {
        isMove = true;
        genLog(`${dictionaryLog(selectedPiece.color)} ${dictionaryLog(selectedPiece.type)} at ${selectedPiecePos.spot} moved to ${pos}`,
          selectedPiece.color,
          false)
      }
    }

    // If isMove, update piece position
    if (isMove) {
      selectedPiece.position.x = x
      selectedPiece.position.y = y
      selectedPiece.moved = true

      // Pawn promotion
      if (selectedPiece.type == 'P' && !gameEnded && (selectedPiece.position.y == 8 || selectedPiece.position.y == 1)) {
        selectedPiece.type = 'Q';
        genLog(`${dictionaryLog(selectedPiece.color)} promoted pawn at ${pos} to ${dictionaryLog(selectedPiece.type)}`, selectedPiece.color, false);
      }

      if (!gameEnded) {
        resetVariables()
        TURN = !TURN
        turnDomChange()
      }
      return
    }

    let isPiece = checkPiece(x, y)
    if (isPiece != false) {
      if (isPiece.color == TURN) {
        selectedPiecePos = { x: x, y: y, spot: convertToLetter(x) + y }
        selectedPiece = isPiece
      } else {
        resetVariables()
      }
    } else {
      resetVariables()
    }
    selectedSlot = { x: x, y: y, spot: convertToLetter(x) + y }
  }

  return false
}

class Piece {
  constructor(t, x, y, c) {
    this.type = t
    this.position = { x, y }
    this.color = c
    this.moved = false
  }

  selfDraw() {
    if (this.color) {
      fill(60)
    } else {
      fill(255)
    }
    circle(this.position.x * squareSize - (squareSize / 2), (canvasSize + (squareSize / 2)) - squareSize * this.position.y, squareSize / 1.5)

    fill(255)
    if (!this.color) fill(0)
    textSize(fontLarge)
    text(this.type, this.position.x * squareSize - (squareSize * 0.6), (canvasSize + (squareSize * 0.6)) - squareSize * this.position.y)
  }
}