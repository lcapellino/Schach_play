$(document).ready(function() {
    $("body").on('click','.moveable',function () {

        var y = $(this).attr("y");
        var x = $(this).attr("x");
        $(this).addClass("selected");
        $.ajax({
            url: "/select?y=" + y + "&x=" + x + "&webSocketID=" + WEBSOCKET_ID,
            success: function(result){
            $("td").removeClass("selected");
            $("td").removeClass("selectableField");

           var moveJson = JSON.parse(result);
           moveJson.moves.forEach(function(field){
               var y = parseInt(field.y) + 1;
              $("#"+ columnCharacter[field.x]+y).addClass('selectableField');

           });
        }});
    });

    $("body").on('click','.selectableField' , function () {
        var source = $(".selected").parent().attr("id");
        var dest = $(this).attr("id");
        $.ajax({
            url: "/move?move=" + source+"-"+dest + "&webSocketID=" + WEBSOCKET_ID,
            success: function(result){
                //expect Websocket event.
            }});
       // document.location.href = "/move?move=" + source + "-"+ dest;
    });
});