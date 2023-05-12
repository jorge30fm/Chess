class Chessboard {
    constructor() {
        this.grid = [  
        [new Rook("white", [0, 0]), new Knight("white", [0, 1]), new Bishop("white", [0, 2]), new Queen("white", [0, 3]), new King("white", [0, 4]), new Bishop("white", [0, 5]), new Knight("white", [0, 6]), new Rook("white", [0, 7])],
        [new Pawn("white", [1, 0]), new Pawn("white", [1, 1]), new Pawn("white", [1, 2]), new Pawn("white", [1, 3]), new Pawn("white", [1, 4]), new Pawn("white", [1, 5]), new Pawn("white", [1, 6]), new Pawn("white", [1, 7])],
        [{}, {}, {}, {}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}, {}, {}, {}],
        [new Pawn("black", [6, 0]), new Pawn("black", [6, 1]), new Pawn("black", [6, 2]), new Pawn("black", [6, 3]), new Pawn("black", [6, 4]), new Pawn("black", [6, 5]), new Pawn("black", [6, 6]), new Pawn("black", [6, 7])],
        [new Rook("black", [7, 0]), new Knight("black", [7, 1]), new Bishop("black", [7, 2]), new Queen("black", [7, 3]), new King("black", [7, 4]), new Bishop("black", [7, 5]), new Knight("black", [7, 6]), new Rook("black", [7, 7])],
        ];
        //add event listeners to the chessboard squares
        const squares = document.querySelectorAll('.square');
        squares.forEach((square) => {
        square.addEventListener('click', (event) => {
            const clickedElement = event.target;
            let row, col;
            ;
            if (clickedElement.tagName === 'IMG') {
            row = clickedElement.parentElement.parentElement.dataset.row;
            col = clickedElement.parentElement.dataset.col;
            } else {
            row = square.parentElement.dataset.row;
            col = square.dataset.col;
            }
            
            this.handleSquareClick(row, col);
            });
        });

        //properties
        this.players = [];
        this.gameOver = false;
        this.currentTurn = 'white';
        this.moves=[];
        this.selectedPiece = null;
        this.selectedSquare = null;
        this.isCheck = false;
        this.isCheckmate = false;
        this.isStalemate = false
        this.capturedPieces = []
        this.history = []
        
    }
    //methods
    getArrayIndexFromCoords(row, col){
        const colIndex = col.charCodeAt(0) - 'a'.charCodeAt(0);
        const rowIndex = row - 1;
        return [rowIndex, colIndex];
    }getCoordsFromArrayIndex(row, col){
        const colCoord = String.fromCharCode('a'.charCodeAt(0) + col);
        const rowCoord = row + 1;
        return [rowCoord, colCoord];
    }
    
    handleSquareClick(row, col){   
        //update the selected square  
        this.selectedSquare = {row, col};
        //get the piece from the grid
        const [rowIndex, colIndex] = this.getArrayIndexFromCoords(row, col);
        const piece = this.grid[rowIndex][colIndex];
        
        
        // if no piece has been previously selected and the clicked square is not empty
        if (!this.selectedPiece && Object.keys(piece).length !== 0) {
            //and if the piece belongs to the current player
            if (piece.color === this.currentTurn) {
                this.selectedPiece = piece;
                this.highlightPossibleMoves();
            }
        // if a piece has been previously selected 
        } else if (this.selectedPiece) {
            //if the new clicked square is empty
            if (Object.keys(piece).length === 0) {           
                //check if the move is valid
                const fromIndex = this.selectedPiece.position;
                const toIndex = [rowIndex, colIndex];
                const valid = this.isMoveLegal(fromIndex, toIndex);
                
                if (valid) {
                    //algebraic chess notation
                    const fromCoord= this.selectedPiece.getPositionBoard(); 
                    const toCoord=[this.selectedSquare.row, this.selectedSquare.col]; 
                    //move the piece
                    this.movePiece(fromCoord, toCoord, fromIndex, toIndex)
                }
                // if there is a piece on the clicked square
            } else {
                //if the piece belongs to the current player
                if (piece.color === this.currentTurn) {
                    //select the new piece
                    console.log("new piece selected")
                    this.selectedPiece =  piece;
                    this.removeHighlight()
                    console.log(piece)
                    this.highlightPossibleMoves();
                } else {
                    //capture the piece
                    const fromIndex = [this.selectedPiece.rowIndex, this.selectedPiece.colIndex];
                    const toIndex = [rowIndex, colIndex];
                    const valid = this.isMoveLegal(fromIndex, toIndex);
                    if (valid) {
                        //algebraic chess notation
                        const fromCoord=this.getCoordsFromArrayIndex(fromIndex[0], fromIndex[1]); 
                        const toCoord=[this.selectedSquare.row, this.selectedSquare.col];;        
                         //move the piece
                        this.movePiece(fromCoord, toCoord, fromIndex, toIndex)
                    }
                }

            }
        }
    
    }
    movePiece(fromCoord, toCoord, fromIndex, toIndex){
        this.movePieceGrid(fromIndex, toIndex);
        this.movePieceBoard(fromCoord, toCoord);
        this.selectedPiece = null;
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
        this.removeHighlight();
        
    }
    movePieceGrid(fromIndex, toIndex){
        //select the piece
        const piece = this.grid[fromIndex[0]][fromIndex[1]];
        //update the piece position
        piece.position = toIndex;
        //move the piece in the gird
        this.grid[toIndex[0]][toIndex[1]] = piece;
        //remove the piece from the old position
        this.grid[fromIndex[0]][fromIndex[1]] = {};
       
    }
    movePieceBoard(fromCoords, toCoords){
        //update the HTML UI
        const fromSquare = document.querySelector(`.square[data-row="${fromCoords[0]}"][data-col="${fromCoords[1]}"]`);
        const toSquare = document.querySelector(`.square[data-row="${toCoords[0]}"][data-col="${toCoords[1]}"]`);
        //move the piece
        toSquare.innerHTML = fromSquare.innerHTML;
        fromSquare.innerHTML = '';
    }
    isCheckmate(player){
        //check if king is in check
        if (!this.isKingSafe(player)) {
            //Check if any move can get the king out of check
            for (let i=0; i < this.moves.length; i++) {
                const move = this.moves[i];
                if (move.piece.color === player && this.isMoveLegal(move.from, move.to)) {
                    const move = this.moves[i];
                    if (this.isKingSafe(player)) {
                        //undo the move and return false since the king is no longer in checkmate
                        this.undoMove(move.from, move.to, capturedPiece);
                        return false;
                    }
                    this.undoMove(move.from, move.to, capturedPiece);
                }
            }
            //since no move can get the king out of check, return true for checkmate
            return true;
        }
        //if the king is not in this.isCheck, return false for checkmate 
        return false;
    }
    findKing(player){
        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid[row].length; col++) {
                const piece = this.grid[row][col];
                if (piece !== null && piece.color === player && piece.type === 'king') {
                    return {row, col};
                }
            }
        }
    };
    isMoveLegal(from, to){
        return true
    };
    isCheck(player){};
    isKingSafe(player){};
    undoMove(from, to, capturedPiece){};
    highlightPossibleMoves(){
        const moves = this.selectedPiece.getPossibleMoves()
        moves.forEach((move) => {
            const [row, col] = move;
            const [rowCoord, colCoord] = this.getCoordsFromArrayIndex(row, col);
            const square = document.querySelector(`.square[data-row="${rowCoord}"][data-col="${colCoord}"]`);
           
            square.classList.add('highlight')
        })
    }
    removeHighlight(){
        const squares = document.querySelectorAll('.square');
        squares.forEach((square) => {
            square.classList.remove('highlight')
        })
    }
}

class ChessPiece {
    constructor(color, position) {
        this.color = color;
        this.position = position;
    }   
    //methods
    getPositionGrid(){
        const colIndex = col.charCodeAt(0) - 'a'.charCodeAt(0);
        const rowIndex = row - 1;
        return [rowIndex, colIndex];
    }
    getPositionBoard(){
        const colCoord = String.fromCharCode('a'.charCodeAt(0) + this.position[1]);
        const rowCoord = this.position[0] + 1;
        return [rowCoord, colCoord];
    }
}

// TODO: Subclasses
class Pawn extends ChessPiece {
    constructor(color, position) {
        super(color, position);
        this.type = 'pawn';
        this.symbol = "P";
        this.value = 1;
    }
    //methods
    getPossibleMoves(){
        const [row, col] = this.position;
        const moves = [];
        if (this.color === 'white') {
            const nextRow = row +1;
            const nextCol = col;
            moves.push([nextRow, nextCol]);
        } else {
            const nextRow = row - 1;
            const nextCol = col;
            moves.push([nextRow, nextCol]);
        }
        return moves;
    }
}
class Rook extends ChessPiece {
    constructor(color, position) {
        super(color, position);
        this.type = 'rook';
    }
    //methods
    getPossibleMoves(){
       
        const [row, col] = this.position;
        const moves = [];
        for (let i = 0; i < 8; i++) {
            if (i !== col) {
                moves.push([row, i]);
            }
        }
        for (let i = 0; i < 8; i++) {
            if (i !== row) {
                moves.push([i, col]);
            }
        }
        return moves;
    }
}
class Knight extends ChessPiece {
    constructor(color, position) {
        super(color, position);
        this.type = 'knight';
        this.symbol = "N";
        this.value = 3;
    }
    //methods
    getPossibleMoves(){
        const [row, col] = this.position;
        const moves = [];
        const possibleMoves = [
            [row + 2, col + 1],
            [row + 2, col - 1],
            [row - 2, col + 1],
            [row - 2, col - 1],
            [row + 1, col + 2],
            [row + 1, col - 2],
            [row - 1, col + 2],
            [row - 1, col - 2],
        ];
        possibleMoves.forEach((move) => {
            const [row, col] = move;
            if (row >= 0 && row < 8 && col >= 0 && col < 8) {
                moves.push(move);
            }
        });
        return moves;
    }
}
class Bishop extends ChessPiece {
    constructor(color, position) {
        super(color, position);
        this.type = 'bishop';
        this.symbol = "B";
        this.value = 3;
    }
    //methods
    getPossibleMoves() {
        const [row, col] = this.position;
        const moves = [];
      
        // Top-left diagonal
        for (let i = 1; row - i >= 0 && col - i >= 0; i++) {
          moves.push([row - i, col - i]);
        }
      
        // Top-right diagonal
        for (let i = 1; row - i >= 0 && col + i < 8; i++) {
          moves.push([row - i, col + i]);
        }
      
        // Bottom-left diagonal
        for (let i = 1; row + i < 8 && col - i >= 0; i++) {
          moves.push([row + i, col - i]);
        }
      
        // Bottom-right diagonal
        for (let i = 1; row + i < 8 && col + i < 8; i++) {
          moves.push([row + i, col + i]);
        }
      
        return moves;
      }
      
}
class Queen extends ChessPiece {
    constructor(color, position) {
        super(color, position);
        this.type = 'queen';
        this.symbol = "Q";
        this.value = 9;

    }
    //methods
    getPossibleMoves(){
        const [row, col] = this.position;
        const moves = [];
        for (let i = 0; i < 8; i++) {
            if (i !== col) {
                moves.push([row, i]);
            }
        }
        for (let i = 0; i < 8; i++) {
            if (i !== row) {
                moves.push([i, col]);
            }
        }
         // Top-left diagonal
         for (let i = 1; row - i >= 0 && col - i >= 0; i++) {
            moves.push([row - i, col - i]);
          }
        
          // Top-right diagonal
          for (let i = 1; row - i >= 0 && col + i < 8; i++) {
            moves.push([row - i, col + i]);
          }
        
          // Bottom-left diagonal
          for (let i = 1; row + i < 8 && col - i >= 0; i++) {
            moves.push([row + i, col - i]);
          }
        
          // Bottom-right diagonal
          for (let i = 1; row + i < 8 && col + i < 8; i++) {
            moves.push([row + i, col + i]);
          }
        

        return moves;


    }
}
class King extends ChessPiece {
    constructor(color, position) {
        super(color, position);
        this.type = 'king';
        this.symbol = "K";
        this.value = 100;
    }
    //methods
    getPossibleMoves(){
        const [row, col] = this.position;
        const moves = [];
        const possibleMoves = [
            [row + 1, col + 1],
            [row + 1, col - 1],
            [row - 1, col + 1],
            [row - 1, col - 1],
            [row + 1, col],
            [row - 1, col],
            [row, col + 1],
            [row, col - 1],
        ];
        possibleMoves.forEach((move) => {
            const [row, col] = move;
            if (row >= 0 && row < 8 && col >= 0 && col < 8) {
                moves.push(move);
            }
        });
        return moves;
        
    }
}

// player class
class Player {
    //color
    // pieces
    // isTurn
    
}


//create a new instance of the chessboare class
const board = new Chessboard();

