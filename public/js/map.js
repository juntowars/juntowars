   function GetMap() {
        return $.ajax({
		    type: 'GET',
		    url: location.origin + '/getBaseBoard',
		    dataType: 'json',
		    success: function(data) { 
		    	console.log( "JSON Data: " + data );
	        },
		    data: {},
		    async: true
		});
   }

	// Renders the map to the page.
	function RenderMap(data) {
		// Board element.
		var map = $("<div>", {
			id : "map"
		}).appendTo(document.body);
		
        var boardBackgroundMap = data[0].map;

		// Board size.
		var rows = boardBackgroundMap.length;
		var	cols = boardBackgroundMap[0].length;
		
		// Inner, scrollable map container.
		var mapHolder = $("<div>", {
			id : "mapHolder",
			css : {
				width : cols * 94
			}
		}).appendTo(map);
		
		// Generate a row of hexes as html.
		var rowHtml = "<div>";
		for (var i = 0; i < cols; i++)
			rowHtml += '<div class="hex"></div>';
		rowHtml += "</div>";
		
		// Main map html.
		var mapHtml = "";
		for (i = 0; i < rows; i++)
			mapHtml += rowHtml;
		
		// Set map contents.
		mapHolder.html(mapHtml);
		
		// Generate hex terrain.
		var rowCounter = 0;
		var y = 0;
		var hexElements = $(".hex").each(function(index,value) {
			var x = index%cols; 
			if ( rowCounter == cols){
				y = y + 1;
				rowCounter = 0;
			} 
			rowCounter++;

			if( boardBackgroundMap[y][x] == 0 )
				this.className += " water";
			else if( boardBackgroundMap[y][x] == 1 )
				this.className += " grass";
			else if( boardBackgroundMap[y][x] == 2 )
				this.className += " forest";
			else
				this.className += " desert";
		});
	}