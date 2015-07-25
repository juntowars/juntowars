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
    return [infantrySvgOpen , race , infantrySvgClose].join('');
  }
}

function displayRangedUnits(race, numberOfUnits) {
  if (numberOfUnits == 0) {
    return "";
  } else {
    var rangedSvgOpen = '<g><polygon points="60,5 40,40 80,40" class="';
    var rangedSvgClose = '"/><text x="55" y="35" font-family="Verdana" font-size="20" fill="black">' + numberOfUnits + '</text></g>';
    return [rangedSvgOpen , race , rangedSvgClose].join('');
  }
}

function displayTankUnits(race, numberOfUnits) {
  if (numberOfUnits == 0) {
    return "";
  } else {
    var svgOpen = '<g><rect x="50" y="50" width="40" height="40" class="';
    var svgClose = '" /><text x="60" y="75" font-family="Verdana" font-size="20" fill="black">' + numberOfUnits + '</text> </g>';
    return [svgOpen , race , svgClose].join('');
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
  $(".hex").each(function (index) {
    if (((posY * cols) + posX) == index) {
      this.innerHTML = getMenu(index) + getSvgForUnits(faction, infantry, ranged, tank);
    }
  });
}

function RenderMap(boardBackgroundMap) {
// Board element.
  var map = $("<div>", {
    id: "map"
  }).appendTo(document.body);

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
    rowHtml += '<div class="hex"><svg height="100" width="100"></svg></div>';
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

