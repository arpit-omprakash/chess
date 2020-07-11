// Game variables
var board = null
var game = new Chess()
var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'
var positionCount

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

function minimax(depth, game, isMaximisingPlayer){
  positionCount++
  if (depth === 0){
    return -evaluateBoard(game.board())
  }

  let newGameMoves = game.moves()

  if (isMaximisingPlayer){
    let bestMove = -9999
    for(let i = 0; i < newGameMoves.length; i++){
      game.move(newGameMoves[i])
      bestMove = Math.max(bestMove, minimax(depth - 1, game, !isMaximisingPlayer))
      game.undo()
    }
    return bestMove
  } else {
    let bestMove = 9999
    for(let i = 0; i < newGameMoves.length; i++){
      game.move(newGameMoves[i])
      bestMove = Math.min(bestMove, minimax(depth - 1, game, !isMaximisingPlayer))
      game.undo()
    }
    return bestMove
  }
}

function minimaxRoot(depth, game, isMaximisingPlayer){
  let newGameMoves = game.moves()
  let bestMove = -9999
  let bestMoveArr = []
  let bestMoveFound

  for(let i = 0; i < newGameMoves.length; i++){
    let newGameMove = newGameMoves[i]
    game.move(newGameMove)
    let value = minimax(depth - 1, game, !isMaximisingPlayer)
    game.undo()
    if (value > bestMove){
      bestMove = value
      bestMoveArr.splice(0, bestMoveArr.length)
      bestMoveArr.push(newGameMove)
    } else if (value === bestMove){
      bestMoveArr.push(newGameMove)
    }

    let randomIdx = Math.floor(Math.random() * bestMoveArr.length)
    bestMoveFound = bestMoveArr[randomIdx]
  }
  return bestMoveFound
}

function calculateBestMove(game){
  positionCount = 0
  let depth = parseInt($('#search-depth').find(':selected').text())

  let d = new Date().getTime()
  let bestMove = minimaxRoot(depth, game, true)
  let d2 = new Date().getTime()
  let moveTime = (d2 - d)
  let positionsPerS = (positionCount * 1000 / moveTime)

  $('#position-count').text(positionCount)
  $('#time').text(moveTime/1000 + 's')
  $('#positions-per-s').text(positionsPerS)
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
