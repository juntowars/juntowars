function RenderStatusBar() {
    $("<div id='statusBar'><div id='subStatusBar'>1</div><div id='subStatusBar' >2</div><div id='subStatusBar'>3</div></div></div>")
        .appendTo(document.body);
}

$(document).ready(function(){
    $("#subStatusBarToggle").click(function(){
        if( $('#subStatusBar').is(":visible") ){
            $("#subStatusBar").slideUp(200);
            $("#statusBar").slideUp(300);
        } else {
            $("#statusBar").slideDown(200);
            $("#subStatusBar").slideDown(400);
        }
    });
});