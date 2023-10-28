
//le gameboard, responsabilite d'etre creer et rempli les cells en appelant les methodes de Cell
function GameBoard(){
    const row = 3;
    const column = 3;
    const board = [];

    for ( let i = 0 ; i < row; i++) {
        board[i] = []
        for (let j = 0; j < column; j++) {
            board[i].push(Cell());
        }
    }

    const getLegalMoves = () => {
        const movesList = [];
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < column; j++) {
                if (board[i][j].getValue() === 0) {
                    movesList.push({i,j});
                }
            }
        }
        return movesList;
    }
    //la logique de changer une valeur dans le board
    const placeToken = (playerNumber, row, column) => {
        if (!board[row][column].getValue()) {
            board[row][column].changeValue(playerNumber);
            return true;
        }
        else {
            console.log("can't place token on occupied cell");
            return false;
        }
    }

    //output le board
    const printBoard = () => {
        const terminalBoard = board.map((row) => row.map((cell) => cell.getValue()))
        console.log(terminalBoard);
    }
    const resetToken = (row, column) => {
        board[row][column].changeValue(0);
    }

    //getter
    const getBoard = ()=> board;

    //exposer les fonctions quon veut montrer
    return {getBoard, printBoard, placeToken, getLegalMoves, resetToken};
}


//board unit qui contient la valeur du token
function Cell(){
    let value = 0;
    const changeValue = (playerNumber)=> {
        value = playerNumber;
    }
    const getValue = ()=>value;
    return {changeValue, getValue};
}

//controle le tour des joueurs, appelle les methodes de gameboard pour changer de valeur
function GameController(botGame = false){
    //le jeu contient un board
    const gameBoard = GameBoard();
    const players = [{playerName: 'player1', playerNumber: 1}, {playerName: 'player2', playerNumber:2}];
    let activePlayer = players[0];

    const switchPlayer = ()=> {
        if (activePlayer === players[0]) {
            activePlayer = players[1];
            if(botGame === true) {
                const move = botMove(gameBoard);
                placeToken(move.row, move.column);
            }
        }
        else {
            activePlayer = players[0];
        }
    }

    
    const showGameState = () => {
        gameBoard.printBoard();
    }
    
    //logique de jeu qui se fait juste called dans le gameboard
    const placeToken = (row, column)=> {
        if(gameBoard.placeToken(activePlayer.playerNumber, row, column)) {
            showGameState();
            let gameState = checkWinCondition(gameBoard);
            if(!gameState) {
                switchPlayer();
            }
            else if (gameState !="tie") {
                console.log(`${activePlayer.playerName} a gagner la partie`);
            }
            else {
                console.log("its a tie");
            }
        }
    }
    

    const botMove = (board)=> {
        let bestMove;
        let score = -Infinity;
        const legalMoves = board.getLegalMoves();
        for(let i = 0; i < legalMoves.length; i++) {
            board.placeToken(2, legalMoves[i].i, legalMoves[i].j);
            let boardValue = minimax(gameBoard, 9 - legalMoves.length, false);
            board.resetToken(legalMoves[i].i, legalMoves[i].j);
            if (boardValue > score) {
                score = boardValue;
                bestMove = {row : legalMoves[i].i , column : legalMoves[i].j}
            }
        }

        return bestMove;
    }

    const scores = {
        "player1" : -10,
        "player2" : 10,
        "tie": 0
    }

    function minimax(board,depth,isMaximize) {

        let result = checkWinCondition(board);
        let legalMoves = board.getLegalMoves();
        if (result != null || legalMoves.length === 0) {
            return scores[result];

        }

        if (isMaximize) {
            let bestScore = -Infinity;

            for(let i = 0; i < legalMoves.length; i++) {
                board.placeToken(2, legalMoves[i].i, legalMoves[i].j,);
                let boardValue = minimax(board,depth + 1, false);
                bestScore = Math.max(boardValue, bestScore); 
                board.resetToken(legalMoves[i].i, legalMoves[i].j);
            }
            return bestScore;
        }

        
        if (!isMaximize) {
            let bestScore = Infinity;

            for(let i = 0; i < legalMoves.length; i++) {
                board.placeToken(1, legalMoves[i].i, legalMoves[i].j,);
                let test = minimax(board, depth + 1, true);
                bestScore = Math.min(test, bestScore);
                board.resetToken(legalMoves[i].i, legalMoves[i].j);
            }
            return bestScore;
        }
    }

    const checkWinCondition = (board)=> {
        let endGameState = null;
        let winBoard = board.getBoard().map((row) => row.map((cell) => cell.getValue()));
        for (let i = 0; i < 3; i++) {
            //check rows
            if (winBoard[i].every((currentValue)=> currentValue === winBoard[i][0])) {
                if (winBoard[i][0] !== 0) {
                    let result = players.find(player => player.playerNumber === winBoard[i][0]);
                    endGameState = result.playerName;
                    break;
                }
            }
            //check column
            if ((winBoard[0][i] === winBoard[1][i]) && (winBoard[1][i] === winBoard[2][i])) {
                if (winBoard[0][i] !== 0) {
                    let result = players.find(player => player.playerNumber === winBoard[0][i]);
                    endGameState = result.playerName;
                    break;
                }
                }
        }
        //check diagonal
        if (((winBoard[0][0] === winBoard[1][1]) && (winBoard[1][1] === winBoard[2][2]) && winBoard[0][0] != 0)||
            (winBoard[0][2] === winBoard[1][1]) && (winBoard[1][1] === winBoard[2][0]) && winBoard[0][2] != 0) {
                let result = players.find(player => player.playerNumber === winBoard[1][1]);
                endGameState = result.playerName;
            }
        
        if(board.getLegalMoves().length === 0 && endGameState === null) {
            endGameState = "tie";
        }
        return endGameState;
    }
    return {placeToken};
}


const game = GameController(true);
console.log('gameStarted');
