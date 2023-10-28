
//le gameboard, responsabilite d'etre creer et rempli les cells en appelant les methodes de Cell
function GameBoard(){
    //var initialization
    const row = 3;
    const column = 3;
    const board = [];
    //creating board
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

    const assignBoard = (board)=> {

    }
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
                // console.log(move);
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
            // let winBoard = gameBoard.getBoard().map((row) => row.map((cell) => cell.getValue()));
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
    
    const testFunction = () => {
        const testBoard = GameBoard();
        let testPurpose = [[1,1,2],
                           [0,1,0],
                           [0,0,2]];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j< 3; j++) {
                testBoard.placeToken(testPurpose[i][j], i, j);
            }
        }
        testBoard.printBoard();
        let bestMove;
        let bestScore = -Infinity;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j< 3; j++) {
                if(testBoard.getBoard()[i][j].getValue() === 0) {
                    testBoard.placeToken(2, i, j);
                    console.log("BEFORE CALLING MINIMAX");
                    testBoard.printBoard();
                    let result = minimax(testBoard, 4, false);
                    console.log("THIS SHOULD BE THE RESULT");
                    console.log(result);
                    testBoard.resetToken(i, j);
                    console.log("AFTER CALLING MINIMAX");
                    testBoard.printBoard();
                    if (result > bestScore) {
                        // console.log("INSIDE THE IF")
                        bestScore = result;
                        // console.log(bestScore);
                        bestMove = {i,j};
                    }
                }
            }
        }
        console.log(bestMove);
    }

    const botMove = (board)=> {
        let bestMove;
        let score = -Infinity;
        const legalMoves = board.getLegalMoves();
        console.log(legalMoves);
        for(let i = 0; i < legalMoves.length; i++) {
            // gameBoard.placeToken(2, legalMoves[i].i, legalMoves[i].j);
            board.getBoard()[legalMoves[i].i][legalMoves[i].j].changeValue(2);
            showGameState();
            let boardValue = minimax(gameBoard,0, false); 
            board.getBoard()[legalMoves[i].i][legalMoves[i].j].changeValue(0);
            // gameBoard.resetToken(legalMoves[i].i, legalMoves[i].j);
            console.log(boardValue);
            if (boardValue > score) {
                score = boardValue;
                // console.log(score);
                bestMove = {row : legalMoves[i].i , column : legalMoves[i].j}
                break;
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

        let result = checkWinCondition(board); // tie, player1 ou player2 a la fin d'une game might be the problem lol
        let legalMoves = board.getLegalMoves();
        // console.log("NUMBER LEGAL MOVES LEFT");
        // console.log(legalMoves.length);
        if (result != null || legalMoves.length === 0) {
            // console.log(`winner : ${result}`);
            // console.log(`score : ${scores[result]}`);
            return scores[result];
            // if (scores[result] < 0) {
            //     return scores[result] + depth;
            // }
            // else if (scores[result] > 0) {
            //     return scores[result] - depth;
            // }
            // else {
            //     return scores[result];
            // }
        }

        if (isMaximize) {
            let bestScore = -Infinity;

            for(let i = 0; i < legalMoves.length; i++) {
                // board.placeToken(2, legalMoves[i].i, legalMoves[i].j,);
                board.getBoard()[legalMoves[i].i][legalMoves[i].j].changeValue(2);
                let boardValue = minimax(board,depth + 1, false);
                bestScore = Math.max(boardValue, bestScore); 
                // board.resetToken(legalMoves[i].i, legalMoves[i].j);
                board.getBoard()[legalMoves[i].i][legalMoves[i].j].changeValue(0);
            }
            // return bestScore - depth;
            return bestScore;
        }

        
        if (!isMaximize) {
            let bestScore = Infinity;

            for(let i = 0; i < legalMoves.length; i++) {
                // board.placeToken(1, legalMoves[i].i, legalMoves[i].j,);
                board.getBoard()[legalMoves[i].i][legalMoves[i].j].changeValue(1);
                let test = minimax(board, depth + 1, true);
                bestScore = Math.min(test, bestScore);
                // board.resetToken(legalMoves[i].i, legalMoves[i].j);
                board.getBoard()[legalMoves[i].i][legalMoves[i].j].changeValue(0);
            }
            // return bestScore + depth;
            return bestScore;
        }
    }

    const checkWinCondition = (board)=> {
        let endGameState = null;
        let winBoard = board.getBoard().map((row) => row.map((cell) => cell.getValue()));
        for (let i = 0; i < 3; i++) {
            //check rows
            if (winBoard[i].every((currentValue)=> currentValue === winBoard[i][0] && winBoard[i][0] != 0)) {
                let result = players.find(player => player.playerNumber === winBoard[i][0]);
                endGameState = result.playerName;
                break;
            }
            //check column
            if ((winBoard[0][i] === winBoard[i][1]) && (winBoard[i][1] === winBoard[i][2]) && winBoard[0][i] != 0 ) {
                let result = players.find(player => player.playerNumber === winBoard[0][i]);
                endGameState = result.playerName;
                break;
                }
        }
        //check diagonal
        if (((winBoard[0][0] === winBoard[1][1]) && (winBoard[1][1] === winBoard[2][2]) && winBoard[0][0] != 0)||
            (winBoard[0][2] === winBoard[1][1]) && (winBoard[1][1] === winBoard[2][1]) && winBoard[0][2] != 0) {
                let result = players.find(player => player.playerNumber === winBoard[1][1]);
                endGameState = result.playerName;
            }
        
        if(board.getLegalMoves().length === 0 && endGameState === null) {
            endGameState = "tie";
        }
        return endGameState;
    }
    return {placeToken, minimax, testFunction};
}


// const game = GameController(true);
const game = GameController();
console.log('gameStarted');
