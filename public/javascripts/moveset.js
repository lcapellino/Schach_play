$(document).ready(function() {
    $(".moveable").click(function () {

        var y = $(this).attr("y");
        var x = $(this).attr("x");
        $(this).addClass("selected");
        $.ajax({url: "/select?y="+y+"&x="+x, success: function(result){
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
        document.location.href = "/move?move=" + source + "-"+ dest;
    });
});