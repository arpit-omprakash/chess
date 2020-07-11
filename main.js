// Game variables
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
var board = null
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

// Logs the position to the console when a move is made (optional function, can be commented)
function onChange(oldPos, newPos){
  console.log('Position Changed')
  console.log('New Position: ' + Chessboard.objToFen(newPos))
}

// Executed when a piece is dragged
function onDragStart(source, piece, position, orientation){
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
  // Console logs for debugging
  console.log('Drag Started')
  console.log('Source: ' + source)
  console.log('Piece: ' + piece)
  console.log('Position: ' + Chessboard.objToFen(position))
  console.log('Orientation: ' + orientation)
}

// Executed when a piece is dropped on the board
function onDrop(source, target){
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
  removeGreySquares()
}

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
  // $fen.html(game.fen())
  $pgn.html(game.pgn())
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

// Game configuration
var config = {
  position: 'start',
  orientation: 'white',
  draggable: true,
  dropOffBoard: 'snapback',
  moveSpeed: 'slow',
  snapbackSpeed: 500,
  snapSpeed: 100,
  sparePieces: false,
  pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
  onChange: onChange,
  onDragStart: onDragStart,
  onSnapEnd: onSnapEnd,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onDrop: onDrop
}

// Final board setup using chessboard.js
var board = Chessboard('myBoard', config)

// Logs the board position to the console
function clickShowPositionBtn () {
  console.log('Current position as an Object:')
  console.log(board.position())

  console.log('Current position as a FEN string:')
  console.log(board.fen())
}

// Reloads the window to reset the game and board
function resetGame(){
  window.location.reload()
  // Another way to reload everything without refreshing the page
  // board.destroy
  // board = Chessboard('myBoard', config)
  // game.reset()
  // if (timer){
  //   clearTimeout(timer)
  //   timer = 0
  // }
  // updateStatus()
}

// Changes the board orientation
function flip(){
  board.flip()
}

// ######################################################################
// Simulation
// ######################################################################

// Function that makes a random move
function makeRandomMove () {
  var possibleMoves = game.moves()

  // exit if the game is over
  if (game.game_over()) return

  var randomIdx = Math.floor(Math.random() * possibleMoves.length)
  game.move(possibleMoves[randomIdx])
  board.position(game.fen())
  updateStatus()

  timer = window.setTimeout(makeRandomMove, 500)
}

// Starts a game between two AIs playing random moves
function playRandom(){
  board.destroy
  game.reset()
  updateStatus()
  board = Chessboard('myBoard', 'start')
  timer = window.setTimeout(makeRandomMove, 500)
}

// #######################################################################
// Bindings to buttons
// #######################################################################

$('#showPositionBtn').on('click', clickShowPositionBtn)

$('#resetBtn').on('click', resetGame)

$('#flipOrientationBtn').on('click', flip)

$('#playRandomBtn').on('click', playRandom)

$(window).resize(board.resize)

// ##################################################################
// Adding the AI interfaces in this section
// ##################################################################

// Loads the level 0 AI script into the head tag
function level0 (){
  board.destroy()
  var newScript = document.createElement('script')
  newScript.type = 'text/javascript'
  newScript.src = 'engine/random.js'
  document.getElementsByTagName('head')[0].appendChild(newScript)
}

// Loads the level 1 AI script into the head tag
function level1 (){
  board.destroy()
  var newScript = document.createElement('script')
  newScript.type = 'text/javascript'
  newScript.src = 'engine/level1.js'
  document.getElementsByTagName('head')[0].appendChild(newScript)
}

// Loads the level 2 AI script into the head tag
function level2 (){
  board.destroy()
  var newScript = document.createElement('script')
  newScript.type = 'text/javascript'
  newScript.src = 'engine/level2.js'
  document.getElementsByTagName('head')[0].appendChild(newScript)
}

// Loads the level 3 AI script into the head tag
function level3 (){
  board.destroy()
  var newScript = document.createElement('script')
  newScript.type = 'text/javascript'
  newScript.src = 'engine/level3.js'
  document.getElementsByTagName('head')[0].appendChild(newScript)
}

// Buttons to start a game against AI

$('#playLevel0').on('click', level0)

$('#playLevel1').on('click', level1)

$('#playLevel2').on('click', level2)

$('#playLevel3').on('click', level3)
