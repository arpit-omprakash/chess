// Game variables
var board = null
var game = new Chess()
var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'

// Function to remove highlight from squares
function removeGreySquares () {
  $('#myBoard .square-55d63').css('background', '')
}

// Function to highlight squares
function greySquare (square) {
  var $square = $('#myBoard .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}

// Binds highlighting to mouse hover
function onMouseoverSquare (square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true
  })

  // exit if there are no moves available for this square
  if (moves.length === 0) return

  // highlight the square they moused over
  greySquare(square)

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to)
  }
}

// Binds highlight clearing to moving mouse out of square
function onMouseoutSquare (square, piece) {
  removeGreySquares()
}

// Function to update status of game
function updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $status.html(status)
  $pgn.html(game.pgn())
}

// Executed when a piece is dragged
function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false
}

// Executed when a piece is dropped on the board
function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for simplicity
    // TODO: Setup promotion function that lets user choose what to promote a given piece to
  })

  // illegal move
  if (move === null) return 'snapback'

  // make random legal move for black
  window.setTimeout(makeAIMove, 250)
  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
  removeGreySquares()
}

// ##########################################################################
// Functions for AI part
// ##########################################################################

// Returns the value of a given piece on the board
function getPieceValue(piece){
  let absValue = 0
  if (piece === null) {
    return 0
  }
  switch (piece.type){
    case 'p':
      absValue = 10
      break
    case 'r':
      absValue = 50
      break
    case 'n':
      absValue = 29
      break
    case 'b':
      absValue = 31
      break
    case 'q':
      absValue = 90
      break
    case 'k':
      absValue = 900
      break
  }
  return piece.color === 'w' ? absValue : -absValue
}

// Returns the value (sum of piece values) of the board at the instance
function evaluateBoard(board){
  let totalEvaluation = 0
  for (let i = 0; i < 8; i++){
    for (let j=0; j < 8; j++){
      totalEvaluation += getPieceValue(board[i][j])
    }
  }
  return totalEvaluation
}

// The AI part that returns the best move at the given instance
// Primitive AI, best move is defined as the move that captures an opponent piece if possible
function calculateBestMove(game){
  let newMoves = game.moves()

  // game over
  if (newMoves.length === 0) return
  // Initialize bestMove variable
  let bestMove = null
  // Set the initial best value to the first move value
  game.move(newMoves[0])
  let bestValue = -evaluateBoard(game.board())
  game.undo()
  let bestMoves = []

  // Iterates to create an array of bestMove(s)
  for (let i = 0; i < newMoves.length; i++){
    let newMove = newMoves[i]
    game.move(newMove)
    // Take negative as AI plays as black
    let boardValue = -evaluateBoard(game.board())
    game.undo()
    if (boardValue > bestValue){
      bestValue = boardValue
      bestMoves.splice(0, bestMoves.length)
      bestMoves.push(newMove)
    } else if (boardValue === bestValue){
      bestMoves.push(newMove)
    }
  }

  // Randomly chooses one move from the bestMoves array
  // Randomness is included to prevent predictive behaviour (just moving rooks in the beginning)
  let randomIdx = Math.floor(Math.random() * bestMoves.length)
  bestMove = bestMoves[randomIdx]
  return bestMove
}

// Calls the calculateBestMove function and makes the move
function makeAIMove(){
  let aiMove = calculateBestMove(game)
  game.move(aiMove)
  board.position(game.fen())
  updateStatus()
}
// ##########################################################################
// Game configuration
// ##########################################################################
var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd
}

// Final board setup from chessboard.js
board = Chessboard('myBoard', config)
updateStatus()
