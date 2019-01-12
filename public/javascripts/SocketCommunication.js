$(document).ready(function(){
    var socket = new WebSocket("ws://localhost:9000/socket");
    socket.onopen = function(){}
    socket.onmessage = function(message){
        if(message.data === "wait"){
            $("body").append("<div class='modal'>");
            $("body").addClass("loading");
        }
        if(message.data === "found"){
            //TODO:
        }
    }
    socket.onerror = function(){ }
    socket.onclose = function(){ }

    $('#white').click(function(){
        socket.send("white");
    });
    $('#black').click(function(){
        socket.send("black");
    });
});