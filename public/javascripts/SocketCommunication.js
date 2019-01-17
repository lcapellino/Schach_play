
//Column translation Array
var columnCharacter = ['A','B','C','D','E','F','G','H'];
var WEBSOCKET_ID = "";
var CURRENT_PLAYER;
var PLAYER_COLOR;



$(document).ready(function(){
    var socketAddr;
    if(window.location.host.startsWith("local")){
        socketAddr = "ws://" +window.location.host;
    } else {
        socketAddr = "wss://" +window.location.host;
    }
    var socket = new WebSocket(socketAddr +"/socket");
    //var socket = new WebSocket("ws://localhost:9000/socket");
    socket.onopen = function(){
        keepAlive();
    }
    socket.onmessage = function(message){
        if(message.data === "wait"){
            $(".chesscontainer").empty().append("<div class=\"d-flex justify-content-center m-5\"><div class=\"spinner-border \" style=\"width: 5rem; height: 5rem;\" role=\"status\"><span class=\"sr-only\">Loading...</span></div></div>");
        }
        if(message.data.startsWith("load:")){
            var id = message.data.substring(5, message.data.length);
            if(id.length > 1){
                WEBSOCKET_ID = encodeURIComponent(id);
            }
            getChessfieldAjax();
        }
    }
    socket.onerror = function(){ }
    socket.onclose = function(){ }


    function keepAlive() {
        var timeout = 20000;
        alert();
        if (socket.readyState == socket.OPEN) {
            socket.send('');
        }
        timerId = setTimeout(keepAlive, timeout);
    }


    $("body").on('click','#white',function () {
        PLAYER_COLOR = 1;
        socket.send("white");
    });
    $("body").on('click','#black',function () {
        PLAYER_COLOR = 0;
        socket.send("black");
    });

    function getChessfieldAjax(){
        $.ajax({
            url: "/json?webSocketID=" + WEBSOCKET_ID,
            context: document.body
        }).done(function(chessBoardJSON) {
            load_chessfield(chessBoardJSON)

        });
    }

    function load_chessfield(chessBoardJSON) {
        CURRENT_PLAYER  = chessBoardJSON.grid.player;
        var board = $('<table class="chesstable"></table>');

        var color;
        var i = 0;
        var cells = chessBoardJSON.grid.cells;

        for (var c = 0; c < 8; c++) {
            var row = $('<tr class=\'chessRow\'></tr>');
            for (var d = 0; d < 8; d++) {
                color = chooseColor(i);
                makeSquare(cells, row, color, c, d);
                i++;
            }
            board.append(row);
        }
        if(CURRENT_PLAYER == PLAYER_COLOR){
            board.addClass("shakeit");
        }
        $(".chesscontainer").empty().append(board);

        alertPlayers();
    }

    function makeSquare(cells,row, color,rownumber, colnumber) {
        var piecePrinted = false;
        var coordinates = "y=" + rownumber + " x=" + colnumber;
        cells.forEach(function(cell){
            if(cell.row == rownumber && cell.col == colnumber){
                var imageString = chooseChesspiece(cell.piece);

                if(PLAYER_COLOR == CURRENT_PLAYER){

                    if(CURRENT_PLAYER && imageString.includes("white")){
                        row.append('<td id="' + columnCharacter[colnumber] + (rownumber+1) + '" class="square ' + color + ' "><div class="tabledata  moveable" hasmoved="'+ cell.hasMoved +'" ' + coordinates+ '>' + imageString + '</div></td>');
                    } else if(!CURRENT_PLAYER && imageString.includes("black")) {
                        row.append('<td id="' + columnCharacter[colnumber] + (rownumber+1) + '" class="square ' + color + ' "><div class="tabledata  moveable" hasmoved="'+ cell.hasMoved +'"' + coordinates+ '>' + imageString + '</div></td>');
                    } else {
                        row.append('<td id="' + columnCharacter[colnumber] + (rownumber+1) + '" class="square ' + color + ' "><div class="tabledata " hasmoved="'+ cell.hasMoved +'"' + coordinates+ '>' + imageString + '</div></td>');
                    }
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

    function alertPlayers(){
        if(CURRENT_PLAYER == PLAYER_COLOR){
            $.growl.notice({ message: "Du bist dran!" });
        }else {
            $.growl.notice({ message: "Dein Gegner ist dran!" });
        }
        /*
         $.growl({ title: "Growl", message: "The kitten is awake!" });
            $.growl.error({ message: "The kitten is attacking!" });
            $.growl.notice({ message: "The kitten is cute!" });
            $.growl.warning({ message: "The kitten is ugly!" });
         */

    }

});