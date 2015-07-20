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

function moveSelectUnits() {
  var movementAction = document.getElementsByClassName('ACTIVE')[0];
  var parentHex = movementAction.parentElement.parentElement;
  var selectedUnitsShapes = parentHex.childNodes[1].getElementsByClassName('selected');

  //todo handle merging units
  //todo fix moving units into previously active space

  while (selectedUnitsShapes.length > 0) {
    var shapeToMove = selectedUnitsShapes[0];
    shapeToMove.classList.remove('selected');

    shapeToMove.parentElement.onclick = null;
    shapeToMove.parentElement.removeAttribute("onclick");

    this.childNodes[0].appendChild(shapeToMove.parentElement);
  }
}

function highlightMoveOptions(index, turnOn) {
  var opacitySetting = turnOn ? 0.5 : 1;
  var allTileElements = document.getElementsByClassName('hex');
  var neighbouringTiles = index % 2 ? [-1, +1, -24, 23, 24, 25] : [-1, +1, -23, -24, -25, 24];

  for (var i = 0; i < neighbouringTiles.length; i++) {
    var hex = allTileElements[index + neighbouringTiles[i]];
    if (hex.className != "hex water") {
      hex.style.opacity = opacitySetting;
      if (turnOn) {
        hex.onclick = moveSelectUnits;
      } else {
        hex.onclick = null;
        hex.removeAttribute("onclick");
      }
    }
  }
}

function handleMoveAction(index, movementAction, turnOn) {
  highlightMoveOptions(index, turnOn);
  movementAction.parentElement.parentElement.childNodes[0].disbled = turnOn;

  var unitList = movementAction.parentElement.parentElement.getElementsByTagName('g');
  for (var i = 0; i < unitList.length; i++) {
    var svgElement = unitList[i];
    if (turnOn) {
      svgElement.onclick = markAsSelected;
    } else {
      svgElement.onclick = null;
      svgElement.removeAttribute("onclick");
    }
  }

  function markAsSelected(){
    this.childNodes[0].classList.add("selected");
  }
}

function scrollToNextAction() {

  var map = $('#map');
  var actionsToSet = $('.fa-plus');

  if (actionsToSet.length > 0) {
    map.scrollTo(actionsToSet, {duration: 1000, axis: 'xy', offset: -150});
  } else {
    //All actions are set, activate all move commands

    var listOfMoves = document.getElementsByClassName('fa-arrow-right');

    for (var i = 0; i < listOfMoves.length; i++) {
      var movementAction = listOfMoves[i];
      movementAction.parentElement.style.background = 'orange';

      movementAction.parentElement.onclick = function () {

        //Mark as active and handle move
        var activeTileInputTag = this.parentElement.getElementsByTagName('input')[0];
        var index = parseInt(activeTileInputTag.attributes.name.value.replace("menu-open", ""));
        this.classList.add('ACTIVE');
        handleMoveAction(index, this, true);

        //End move with second click
        this.onclick = function () {
          handleMoveAction(index, this, false);
          this.style.background = 'grey';
          this.classList.remove('ACTIVE');
        }
      };
    }
  }
}
