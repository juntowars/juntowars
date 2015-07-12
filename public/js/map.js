function GetMap() {
  return $.ajax({
    type: 'GET',
    url: location.origin + '/getBaseBoard',
    dataType: 'json',
    success: function (data) {
      console.log("JSON Data: " + data);
    },
    data: {},
    async: true
  });
}

function getFactionsColour(faction) {
  var geoEngineers = "yellow";
  var settlers = "red";
  var kingdomWatchers = "grey";
  var periplaneta = "blue";
  var reduviidae = "white";
  var guardians = "green";

  switch (faction) {
    case "settlers":
      return settlers;
    case "geoEngineers":
      return geoEngineers;
    case "kingdomWatchers":
      return kingdomWatchers;
    case "periplaneta":
      return periplaneta;
    case "reduviidae":
      return reduviidae;
    case "guardians":
      return guardians;
  }
}

function displayInfantryUnits(unitColour, numberOfUnits) {
  if (numberOfUnits == 0) {
    return "";
  } else {
    var infantrySvgOpen = '<g><circle cx="30" cy="60" r="15" stroke="black" stroke-width="1" fill="';
    var infantrySvgClose = '"></circle><text x="25" y="65" font-family="Verdana" font-size="20" fill="black">' + numberOfUnits + '</text></g>';
    return infantrySvgOpen + unitColour + infantrySvgClose;
  }
}

function displayRangedUnits(unitColour, numberOfUnits) {
  if (numberOfUnits == 0) {
    return "";
  } else {
    var infantrySvgOpen = '<g> <polygon points="60,5 40,40 80,40"stroke="black" stroke-width="1" fill="';
    var infantrySvgClose = '"/><text x="55" y="35" font-family="Verdana" font-size="20" fill="black">' + numberOfUnits + '</text></g>';
    return infantrySvgOpen + unitColour + infantrySvgClose;
  }
}

function displayTankUnits(unitColour, numberOfUnits) {
  if (numberOfUnits == 0) {
    return "";
  } else {
    var svgOpen = '<g><rect x="50" y="50" width="40" height="40" style="fill:';
    var svgClose = ';stroke:black;stroke-width:1;" /><text x="60" y="75" font-family="Verdana" font-size="20" fill="black">' + numberOfUnits + '</text> </g>';
    return svgOpen + unitColour + svgClose;
  }
}

function getSvgForUnits(faction, infanty, ranged, tank) {
  var unitColour = getFactionsColour(faction);
  return '<svg height="100" width="100">' + displayInfantryUnits(unitColour, infanty) + displayRangedUnits(unitColour, ranged) + displayTankUnits(unitColour, tank) + '</svg>';
}

function drawUnits(cols, posX, posY, faction, infantry, ranged, tank) {
  $(".hex").each(function (index) {
    if (((posX * cols) + posY) == index) {
      this.innerHTML = getSvgForUnits(faction, infantry, ranged, tank);
    }
  });
}

function RenderMap(data) {
// Board element.
  var map = $("<div>", {
    id: "map"
  }).appendTo(document.body);

  var boardBackgroundMap = data[0].map;

// Board size.
  var rows = boardBackgroundMap.length;
  var cols = boardBackgroundMap[0].length;

// Inner, scrollable map container.
  var mapHolder = $("<div>", {
    id: "mapHolder",
    css: {
      width: cols * 94
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
  $(".hex").each(function (index) {
    var x = index % cols;
    if (rowCounter == cols) {
      y = y + 1;
      rowCounter = 0;
    }
    rowCounter++;

    if (boardBackgroundMap[y][x] == 0)
      this.className += " water";
    else if (boardBackgroundMap[y][x] == 1)
      this.className += " grass";
    else if (boardBackgroundMap[y][x] == 2)
      this.className += " forest";
    else
      this.className += " desert";
  });

  //todo make call to db for units details
  drawUnits(cols, 3, 4, "settlers", 1, 1, 1);
  drawUnits(cols, 3, 3, "geoEngineers", 0, 0, 1);
}



