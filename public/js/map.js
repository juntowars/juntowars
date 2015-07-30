function GetMap(callback) {
  var request = new XMLHttpRequest();
  var getBaseBoardUrl = location.origin + '/getBaseBoard';
  request.open('GET', getBaseBoardUrl, true);

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      callback(JSON.parse(request.responseText)[0].map);
    }
  };
  request.send();
}

function GetMapUnits(cols, callback) {
  var request = new XMLHttpRequest();
  var getMapUnitsUrl = location.origin + '/getMapUnits/' + window.location.pathname.replace(/.*\//, '');
  request.open('GET', getMapUnitsUrl, true);

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      callback(cols, JSON.parse(request.responseText));
    }
  };
  request.send();
}

function drawAllUnits(cols, units) {
  units.forEach(function (unitSet) {
    drawUnits(cols, unitSet.posX, unitSet.posY, unitSet.race, unitSet.infantry, unitSet.ranged, unitSet.tanks);
  });
}

function GetHudStatistics(callback) {
  var request = new XMLHttpRequest();
  var gameName = window.location.pathname.replace(/.*\//, '');
  //todo hardcoded for now. Add race variable to query
  var race = "kingdomWatchers";

  request.open('GET', location.origin + '/getHudStatistics/' + gameName + '/' + race, true);
  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      callback(JSON.parse(request.responseText));
    }
  };
  request.send();
}

function getMenu(index) {
  return ['<nav class="menu" >',
    '<input type="checkbox" href="#" class="menu-open" name="menu-open' + index + '" id="menu-open' + index + '"/>',
    '<label class="menu-open-button" for="menu-open' + index + '">',
    '<i class="fa fa-plus rotate action-display" ></i>',
    '</label>',
    '<a href="#" class="menu-item" onclick="lockInAction(this,\'fa-arrow-right\')"> <i class="fa fa-arrow-right move-action"></i> </a>',
    '<a href="#" class="menu-item" onclick="lockInAction(this,\'fa-shield\')"> <i class="fa fa-shield defence-action"></i> </a>',
    '<a href="#" class="menu-item" onclick="lockInAction(this,\'fa-bug\')"> <i class="fa fa-bug recruit-action"></i> </a>',
    '<a href="#" class="menu-item" onclick="lockInAction(this,\'fa-cog\')"> <i class="fa fa-cog harvest-action"></i> </a>',
    '</nav>'].join("");
}

function displayInfantryUnits(race, numberOfUnits) {
  if (numberOfUnits == 0) {
    return "";
  } else {
    var infantrySvgOpen = '<g><circle cx="30" cy="60" r="15" id="inf" class="';
    var infantrySvgClose = '"></circle><text x="25" y="65" font-family="Verdana" font-size="20" fill="black">' + numberOfUnits + '</text></g>';
    return [infantrySvgOpen, race, infantrySvgClose].join('');
  }
}

function displayRangedUnits(race, numberOfUnits) {
  if (numberOfUnits == 0) {
    return "";
  } else {
    var rangedSvgOpen = '<g><polygon points="60,5 40,40 80,40" class="';
    var rangedSvgClose = '"/><text x="55" y="35" font-family="Verdana" font-size="20" fill="black">' + numberOfUnits + '</text></g>';
    return [rangedSvgOpen, race, rangedSvgClose].join('');
  }
}

function displayTankUnits(race, numberOfUnits) {
  if (numberOfUnits == 0) {
    return "";
  } else {
    var svgOpen = '<g><rect x="50" y="50" width="40" height="40" class="';
    var svgClose = '" /><text x="60" y="75" font-family="Verdana" font-size="20" fill="black">' + numberOfUnits + '</text> </g>';
    return [svgOpen, race, svgClose].join('');
  }
}

function getSvgForUnits(faction, infantry, ranged, tank) {
  return ['<svg height="100" width="100">',
    displayInfantryUnits(faction, infantry),
    displayRangedUnits(faction, ranged),
    displayTankUnits(faction, tank),
    '</svg>'].join("");
}

function drawUnits(cols, posX, posY, faction, infantry, ranged, tank) {
  var hexes = document.getElementsByClassName('hex');
  for (var i = 0; i < hexes.length; i++) {
    if (((posY * cols) + posX) == i) {
      hexes[i].innerHTML = getMenu(i) + getSvgForUnits(faction, infantry, ranged, tank);
    }
  }
}

function RenderMap(boardBackgroundMap) {
  // Board element.
  document.getElementsByTagName('body')[0].innerHTML += '<div id="map"></div>';
  var map = document.getElementById('map');

  // Board size.
  var rows = boardBackgroundMap.length;
  var cols = boardBackgroundMap[0].length;

  // Inner, scrollable map container.
  map.innerHTML += '<div id="mapHolder" style="width: ' + (cols * 94) + 'px"></div>';
  var mapHolder = document.getElementById('mapHolder');

  // Generate a row of hexes as html.
  var rowHtml = "<div>";
  for (var i = 0; i < cols; i++)
    rowHtml += '<div class="hex"><svg height="100" width="100"></svg></div>';
  rowHtml += "</div>";

  // Main map html.
  var mapHtml = "";
  for (i = 0; i < rows; i++)
    mapHtml += rowHtml;

  // Set map contents.
  mapHolder.innerHTML = mapHtml;

// Generate hex terrain.
  var rowCounter = 0;
  var y = 0;

  var hexes = document.getElementsByClassName('hex');
  for (var i = 0; i < hexes.length; i++) {
    var x = i % cols;
    if (rowCounter == cols) {
      y = y + 1;
      rowCounter = 0;
    }
    rowCounter++;

    if (boardBackgroundMap[y][x] == 0)
      hexes[i].className += " water";
    else if (boardBackgroundMap[y][x] == 1)
      hexes[i].className += " grass";
    else if (boardBackgroundMap[y][x] == 2)
      hexes[i].className += " forest";
    else
      hexes[i].className += " desert";
  }

  // init game pieces
  GetMapUnits(cols, drawAllUnits);

  addHudListeners();
}

