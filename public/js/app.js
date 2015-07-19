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
    if (hex.className != "hex water") hex.style.opacity = opacitySetting;
  }
}

function scrollToNextAction() {

  //todo find non jquery scroller
  var map = $('#map');
  var actionsToSet = $('.fa-plus');

  if (actionsToSet.length > 0) {
    map.scrollTo(actionsToSet, {duration: 1000, axis: 'xy', offset: -150});
  } else {

    var movementAction = document.getElementsByClassName('fa-arrow-right')[0];
    map.scrollTo(movementAction, {duration: 1000, offset: -150});

    var activeTileInputTag = movementAction.parentElement.parentElement.getElementsByTagName('input')[0];
    var index = parseInt(activeTileInputTag.attributes.name.value.replace("menu-open", ""));

    movementAction.parentElement.style.background = 'orange';
    highlightMoveOptions(index, true);
    //var unitsToMove = movementAction.parentElement.parentElement.parentElement.getElementsByTagName('g');
  }
}
