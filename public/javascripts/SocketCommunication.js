
//Column translation Array
var columnCharacter = ['A','B','C','D','E','F','G','H'];
var WEBSOCKET_ID = "";
var CURRENT_PLAYER;
var PLAYER_COLOR;
var waitIcon = $("<div class=\"d-flex justify-content-center m-5\"><div class=\"spinner-border \" style=\"width: 5rem; height: 5rem;\" role=\"status\"><span class=\"sr-only\">Loading...</span></div></div>");



$(document).ready(function(){
    var socketAddr;
    if(window.location.host.startsWith("local")){
        socketAddr = "ws://" +window.location.host;
    } else {
        socketAddr = "wss://" +window.location.host;
    }
    var socket = new WebSocket(socketAddr +"/socket");
    socket.onopen = function(){
        keepAlive();
    }
    socket.onmessage = function(message){
        if(message.data === "wait"){
            $(".chesscontainer").empty().append(waitIcon);
        }
        if(message.data.startsWith("load:")){
            var id = message.data.substring(5, message.data.length);
            if(id.length > 1){
                WEBSOCKET_ID = encodeURIComponent(id);
            }
            getChessfieldAjax();
        }
    }


    function keepAlive() {
        var timeout = 20000;
        if (socket.readyState == socket.OPEN) {
            socket.send('');
        }
        timerId = setTimeout(keepAlive, timeout);
    }

    $("#singleplayer").click(function () {
        window.location = "/singleplayer";
    });

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

            if(PLAYER_COLOR == true){
                $(".chesscontainer").addClass("upsidedown");
                $(".tabledata").addClass("upsidedown");
            }
        });
    }

    function load_chessfield(chessBoardJSON) {
        CURRENT_PLAYER  = chessBoardJSON.grid.player;
        var board = $('<table class="chesstable"></table>');

        var color;
        var i = 0;
        var cells = chessBoardJSON.grid.cells;
        board.append($('<tr class=\'framerow\'><td class="frametop"></td><td class="frametop"><span>H</span></td><td class="frametop"><span>G</span></td><td class="frametop"><span>F</span></td><td class="frametop"><span>E</span></td><td class="frametop"><span>D</span></td><td class="frametop"><span>C</span></td><td class="frametop"><span>B</span></td><td class="frametop"><span>A</span></td><td class="frametop"></td></tr>'));
        for (var c = 0; c < 8; c++) {
            var row = $('<tr class=\'chessRow\'></tr>');
            row.append("<td class='frameside'>"+(c+1)+"</td>");
            for (var d = 0; d < 8; d++) {
                color = chooseColor(i);
                makeSquare(cells, row, color, c, d);
                i++;
            }
            row.append("<td class='frameside upsidedown'>"+(c+1)+"</td>");
            board.append(row);
        }

        board.append($('<tr class=\'framerow flip\'><td class="frametop"></td><td class="frametop"><span>H</span></td><td class="frametop"><span>G</span></td><td class="frametop"><span>F</span></td><td class="frametop"><span>E</span></td><td class="frametop"><span>D</span></td><td class="frametop"><span>C</span></td><td class="frametop"><span>B</span></td><td class="frametop"><span>A</span></td><td class="frametop"></td></tr>'));

        if(CURRENT_PLAYER == PLAYER_COLOR){
            board.addClass("shakeit");
        }

        var audio = new Audio('/assets/sounds/alert.mp3');
        if(chessBoardJSON.grid.whiteCheck == true){
            board.find(".white_king > div > img").addClass("shakeallways");
            if(PLAYER_COLOR == 1){
                audio.play();
            }
        }
        if(chessBoardJSON.grid.blackCheck == true){
            board.find(".black_king > div > img").addClass("shakeallways");
            if(PLAYER_COLOR == 0){
                audio.play();
            }
        }


        $(".chesscontainer").empty().append(board);

        alertPlayers();
    }

    function makeSquare(cells,row, color,rownumber, colnumber) {
        var piecePrinted = false;
        var coordinates = "y=" + rownumber + " x=" + colnumber;
        cells.forEach(function(cell){
            if(cell.posY == rownumber && cell.posX == colnumber){
                var imageString = chooseChesspiece(cell.piece);
                var king_id = "";

                if(imageString.includes("white_king.png")){
                    king_id = "white_king";
                }
                if(imageString.includes("black_king.png")){
                    king_id = "black_king";
                }
                if(PLAYER_COLOR == CURRENT_PLAYER){


                    if(CURRENT_PLAYER && imageString.includes("white")){
                        row.append('<td id="' + columnCharacter[colnumber] + (rownumber+1) + '" class="square ' + color + ' ' + king_id +'"><div class="tabledata  moveable" hasmoved="'+ cell.hasMoved +'" ' + coordinates+ '>' + imageString + '</div></td>');
                    } else if(!CURRENT_PLAYER && imageString.includes("black")) {
                        row.append('<td id="' + columnCharacter[colnumber] + (rownumber+1) + '" class="square ' + color + ' ' + king_id +' "><div class="tabledata  moveable" hasmoved="'+ cell.hasMoved +'"' + coordinates+ '>' + imageString + '</div></td>');
                    } else {
                        row.append('<td id="' + columnCharacter[colnumber] + (rownumber+1) + '" class="square ' + color + ' ' + king_id +' "><div class="tabledata " hasmoved="'+ cell.hasMoved +'"' + coordinates+ '>' + imageString + '</div></td>');
                    }
                } else {
                    row.append('<td id="' + columnCharacter[colnumber] + (rownumber+1) + '" class="square ' + color + ' ' + king_id +' "><div class="tabledata " hasmoved="'+ cell.hasMoved +'"' + coordinates+ '>' + imageString + '</div></td>');
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
            $.growl({ title: "",message: "Du bist dran!" });
        }else {
            $.growl({title: "", message: "Dein Gegner ist dran!" });
        }

    }

});