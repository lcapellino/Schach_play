var columnCharacter = ['A','B','C','D','E','F','G','H'];
$(document).ready(function(){



    var board = $('.chesstable');
    var color;
    var i = 0;
    var cells = chessboard.grid.cells;

    for (var c = 0; c < 8; c++) {
        var row = $('<tr class=\'chessRow\'></tr>');
        for (var d = 0; d < 8; d++) {
            color = chooseColor(i);
            makeSquare(row, color, c, d);
            i++;
        }
        board.append(row);
    }

    function makeSquare(row, color,rownumber, colnumber) {
        var piecePrinted = false;
        var coordinates = "y=" + rownumber + " x=" + colnumber;
        cells.forEach(function(cell){
            if(cell.row == rownumber && cell.col == colnumber){
                var imageString = chooseChesspiece(cell.piece);

                if(player && imageString.includes("white")){
                    row.append('<td id="' + columnCharacter[colnumber] + (rownumber+1) + '" class="square ' + color + ' "><div class="tabledata  moveable" hasmoved="'+ cell.hasMoved +'" ' + coordinates+ '>' + imageString + '</div></td>');
                } else if(!player && imageString.includes("black")) {
                    row.append('<td id="' + columnCharacter[colnumber] + (rownumber+1) + '" class="square ' + color + ' "><div class="tabledata  moveable" hasmoved="'+ cell.hasMoved +'"' + coordinates+ '>' + imageString + '</div></td>');
                } else {
                    row.append('<td id="' + columnCharacter[colnumber] + (rownumber+1) + '" class="square ' + color + ' "><div class="tabledata " hasmoved="'+ cell.hasMoved +'"' + coordinates+ '>' + imageString + '</div></td>');
                }
                piecePrinted = true;
            }
        })
        if(!piecePrinted){
            row.append('<td id="' + columnCharacter[colnumber] + (rownumber+1) + '" class="square ' + color + '"><div class="tabledata" '+ coordinates+ '></div> </td>');

        }
    }

    function chooseColor(num) {
        var row = Math.floor(num / 8);
        var color = "";
        if (row % 2 === 0) {
            if (num % 2 === 0) {
                color = "brown";
            }
            else {
                color = "tan";
            }
        }
        else {
            if (num % 2 === 0) {
                color = "tan";
            }
            else {
                color = "brown";
            }
        }

        return color;
    }
    function chooseChesspiece(chessPieceString){
        var imageString;
        if(chessPieceString == "♗"){
            imageString = "white_bishop.png";
        }
        if(chessPieceString == "♔"){
            imageString = "white_king.png";
        }
        if(chessPieceString == "♘"){
            imageString = "white_knight.png";
        }
        if(chessPieceString == "♙"){
            imageString = "white_pawn.png";
        }
        if(chessPieceString == "♕"){
            imageString = "white_queen.png";
        }
        if(chessPieceString == "♖"){
            imageString = "white_rook.png";
        }

        if(chessPieceString == "♝"){
            imageString = "black_bishop.png";
        }
        if(chessPieceString == "♚"){
            imageString = "black_king.png";
        }
        if(chessPieceString == "♞"){
            imageString = "black_knight.png";
        }
        if(chessPieceString == "♟"){
            imageString = "black_pawn.png";
        }
        if(chessPieceString == "♛"){
            imageString = "black_queen.png";
        }
        if(chessPieceString == "♜"){
            imageString = "black_rook.png";
        }
        return "<img src='/assets/images/"+imageString +"'>";
    }


});