function GetMap() {
  return $.ajax({
    type: 'GET',
    url: location.origin + '/getBaseBoard',
    dataType: 'json',
    data: {},
    async: true
  });
}

function GetMapUnits() {
  var gameName = window.location.pathname.replace(/.*\//, '');
  return $.ajax({
    type: 'GET',
    url: location.origin + '/getMapUnits/' + gameName,
    dataType: 'json',
    data: {},
    async: true
  });
}

function getFactionsColour(faction) {
  var geoEngineers = "#00CCFF";
  var settlers = "#00FFCC";
  var kingdomWatchers = "#CCCC00";
  var periplaneta = "#FF9933";
  var reduviidae = "#FF5050";
  var guardians = "#6666FF";

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

function getMenu(index) {
  return '<nav class="menu" >\
            <input type="checkbox" href="#" class="menu-open" name="menu-open' + index + '" id="menu-open' + index + '"/>\
            <label class="menu-open-button" for="menu-open' + index + '">\
            <i class="fa fa-plus-circle"></i>\
            </label>\
            <a href="#" class="menu-item"> <i class="fa fa-arrow-right"></i> </a>\
            <a href="#" class="menu-item"> <i class="fa fa-shield"></i> </a>\
            <a href="#" class="menu-item"> <i class="fa fa-bug"></i> </a>\
            <a href="#" class="menu-item"> <i class="fa fa-cog"></i> </a>\
          </nav>';
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
    var infantrySvgOpen = '<g> <polygon points="60,5 40,40 80,40" stroke="black" stroke-width="1" fill="';
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
    if (((posY * cols) + posX) == index) {
      this.innerHTML = getMenu(index) + getSvgForUnits(faction, infantry, ranged, tank);
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

  // init game pieces
  $.when(GetMapUnits()).done(function (units) {
    units.forEach(function (unitSet) {
      drawUnits(cols, unitSet.posX, unitSet.posY, unitSet.race, unitSet.infantry, unitSet.ranged, unitSet.tanks);
    });
  });

}



