function NewGame() {
	$.when(GetMap()).done(function(data){
		RenderMap(data);
		RenderStatusBar();
	});
}

$(function() {
	NewGame();
});