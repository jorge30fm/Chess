class Chessboard {
    constructor() {
        this.grid = [  
        [{color: 'white', type: 'rook'}, {color: 'white', type: 'knight'}, {color: 'white', type: 'bishop'}, {color: 'white', type: 'queen'}, {color: 'white', type: 'king'}, {color: 'white', type: 'bishop'}, {color: 'white', type: 'knight'}, {color: 'white', type: 'rook'}],
        [{color: 'white', type: 'pawn'}, {color: 'white', type: 'pawn'}, {color: 'white', type: 'pawn'}, {color: 'white', type: 'pawn'}, {color: 'white', type: 'pawn'}, {color: 'white', type: 'pawn'}, {color: 'white', type: 'pawn'}, {color: 'white', type: 'pawn'}],
        [{}, {}, {}, {}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}, {}, {}, {}],
        [{color: 'black', type: 'pawn'}, {color: 'black', type: 'pawn'}, {color: 'black', type: 'pawn'}, {color: 'black', type: 'pawn'}, {color: 'black', type: 'pawn'}, {color: 'black', type: 'pawn'}, {color: 'black', type: 'pawn'}, {color: 'black', type: 'pawn'}],
        [{color: 'black', type: 'rook'}, {color: 'black', type: 'knight'}, {color: 'black', type: 'bishop'}, {color: 'black', type: 'queen'}, {color: 'black', type: 'king'}, {color: 'black', type: 'bishop'}, {color: 'black', type: 'knight'}, {color: 'black', type: 'rook'}],
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
    }
    getCoordsFromArrayIndex(row, col){
        const colCoord = String.fromCharCode('a'.charCodeAt(0) + col);
        const rowCoord = row + 1;
        return [rowCoord, colCoord];
    }
    handleSquareClick(row, col, clickedElement){     
        this.selectedSquare = {row, col};
        const [rowIndex, colIndex] = this.getArrayIndexFromCoords(row, col);
        const piece = this.grid[rowIndex][colIndex];
        // if no piece has been previously selected and the clicked square is not empty
        if (!this.selectedPiece && Object.keys(piece).length !== 0) {
            //and if the piece belongs to the current player
            if (piece.color === this.currentTurn) {
                this.selectedPiece = {rowIndex: rowIndex, colIndex: colIndex, piece};
                
                // this.highlightPossibleMoves(row, col);
            }
        // if a piece has been previously selected 
        } else if (this.selectedPiece) {
            //if the new clicked square is empty
            if (Object.keys(piece).length === 0) {           
                //check if the move is valid
                const fromIndex = [this.selectedPiece.rowIndex, this.selectedPiece.colIndex];
                const toIndex = [rowIndex, colIndex];
                const valid = this.isMoveLegal(fromIndex, toIndex);
                
                if (valid) {
                    //algebraic chess notation
                    const fromCoord=this.getCoordsFromArrayIndex(fromIndex[0], fromIndex[1]); 
                    const toCoord=[this.selectedSquare.row, this.selectedSquare.col];;        
                     //move the piece
                     this.movePiece(fromCoord, toCoord, fromIndex, toIndex);
                     this.selectedPiece = null;
                     this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
                }
                // if there is a piece on the clicked square
            } else {
                //if the piece belongs to the current player
                if (piece.color === this.currentTurn) {
                    //select the new piece
                    this.selectedPiece = {rowIndex: rowIndex, colIndex: colIndex, piece};
                    // this.highlightPossibleMoves(row, col);
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
                        this.movePiece(fromCoord, toCoord, fromIndex, toIndex);
                        this.selectedPiece = null;
                        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
                    }
                }

            }
        }
    
    }
    
    movePiece(fromCoords, toCoords, fromIndex, toIndex){
        console.log("FROM COORDS = ", fromCoords)
        console.log("TO COORDS = ", toCoords)
        console.log("FROM INDEX = ", fromIndex)
        console.log("TO INDEX = ", toIndex)
        //get col and row chess coordinates to move piece
        
        

        //update the HTML UI
        const fromSquare = document.querySelector(`.square[data-row="${fromCoords[0]}"][data-col="${fromCoords[1]}"]`);
        console.log("FROM SQUARE = ", fromSquare)
        const toSquare = document.querySelector(`.square[data-row="${toCoords[0]}"][data-col="${toCoords[1]}"]`);
         //move the piece
        toSquare.innerHTML = fromSquare.innerHTML;
        fromSquare.innerHTML = '';

        //update the grid
        this.grid[toIndex[0]][toIndex[1]] = this.grid[fromIndex[0]][fromIndex[1]];
        this.grid[fromIndex[0]][fromIndex[1]] = {};
        console.log("GRID = ", this.grid)

    };
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
    getPossibleMoves(position){
        return [];
    };
    isCheck(player){};
    isKingSafe(player){};
    undoMove(from, to, capturedPiece){};
    highlightPossibleMoves(row, col){}
}

class ChessPiece {
    constructor(player) {
        this.player = player;
    }
   //properties
    //color
    //type
    //position
    // possible moves
    
  //methods  
  
}

// TODO: Subclasses
class Pawn extends ChessPiece {}
class Rook extends ChessPiece {}
class Knight extends ChessPiece {}
class Bishop extends ChessPiece {}
class Queen extends ChessPiece {}
class King extends ChessPiece {}

// player class
class Player {
    //color
    // pieces
    // isTurn
    
}


//create a new instance of the chessboare class
const board = new Chessboard();

