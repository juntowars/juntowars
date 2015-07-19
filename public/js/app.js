function lockInAction(element, icon) {
  var middleIcon = element.parentElement.getElementsByClassName('action-display')[0];
  middleIcon.classList.add(icon);
  middleIcon.classList.remove('fa-plus');

  var checkBox = element.parentElement.getElementsByClassName('menu-open')[0];
  checkBox.disabled = true;
  checkBox.checked = false;

  var menuOpenButton = element.parentElement.getElementsByClassName('menu-open-button')[0];
  menuOpenButton.style.background = "green";

  scrollToNextAction();
}

function highlightMoveOptions(index, turnOn) {
  var opacitySetting = turnOn ? 0.5 : 1;
  var allTileElements = document.getElementsByClassName('hex');
  var neighbouringTiles = index % 2 ? [-1, +1, -24, 23, 24, 25] : [-1, +1, -23, -24, -25, 24];

  for (var i = 0; i < neighbouringTiles.length; i++) {
    var hex = allTileElements[index + neighbouringTiles[i]];
    if (hex.className != "hex water") {
      hex.style.opacity = opacitySetting;

      hex.onclick = function () {
        var movementAction = document.getElementsByClassName('fa-arrow-right')[0];
        var parentHex = movementAction.parentElement.parentElement.parentElement;

        //Find selected svg elements
        var svgInParentHex = parentHex.childNodes[1];
        var selectedUnitsShapes = svgInParentHex.getElementsByClassName('selected');

        //Add selected elements into an array
        var newHexElements = [];

        // todo Some sort of mental bug - picking it up on the morrow
        for (var i = 0; i < selectedUnitsShapes.length; i++) {
          var shapeToMove = selectedUnitsShapes[i];
          newHexElements.push(shapeToMove.parentElement.outerHTML);
          svgInParentHex.removeChild(shapeToMove.parentElement);
        }

        //Wrap elements in SVG rapper
        var selectedWrappedSvgArray = ["<svg height='100' width='100'>"].concat(newHexElements).concat(["</svg>"]);

        //Update Clicked tile
        this.innerHTML = selectedWrappedSvgArray.join("");
      }
    }
  }
}

function scrollToNextAction() {

  //todo find non-jquery scroller
  var map = $('#map');
  var actionsToSet = $('.fa-plus');

  if (actionsToSet.length > 0) {
    map.scrollTo(actionsToSet, {duration: 1000, axis: 'xy', offset: -150});
  } else {

    var movementAction = document.getElementsByClassName('fa-arrow-right')[0];
    var activeTileInputTag = movementAction.parentElement.parentElement.getElementsByTagName('input')[0];
    var index = parseInt(activeTileInputTag.attributes.name.value.replace("menu-open", ""));

    map.scrollTo(movementAction, {duration: 1000, offset: -150});
    movementAction.parentElement.style.background = 'orange';
    highlightMoveOptions(index, true);

    var unitList = movementAction
    .parentElement
    .parentElement
    .parentElement
    .getElementsByTagName('g');

    for (var i = 0; i < unitList.length; i++) {
      var shape;
      var svgElement = unitList[i];
      svgElement.onclick = function () {
        shape = this.childNodes[0];
        shape.style.fill = "#33CCFF";
        shape.style.stroke = "white";
        shape.classList.add("selected");
      };
    }

  }
}
