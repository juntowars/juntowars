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

function removeOnClickEvent(element) {
  element.onclick = null;
  element.removeAttribute("onclick");
}

function calculateStrength(elements) {
  var strength = 0;
  for (var i = 0; i < elements.length; i++)
    strength += parseInt(elements[i].getElementsByTagName('text')[0].innerHTML);
  return strength;
}

function calculateSelectedStrength(elements) {
  var strength = 0;
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].childNodes[0].classList.contains("selected")) {
      strength += parseInt(elements[i].getElementsByTagName('text')[0].innerHTML);
    }
  }
  return strength;
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
        removeOnClickEvent(hex);
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
      removeOnClickEvent(svgElement);
    }
  }

  function markAsSelected() {
    this.childNodes[0].classList.add("selected");
  }
}

function scrollToNextAction() {
  var map = $('#map');
  var actionsToSet = $('.fa-plus');

  if (actionsToSet.length > 0) {
    map.scrollTo(actionsToSet, {duration: 1000, axis: 'xy', offset: -150});
  } else {
    enableMoveActions();
  }
}

function enableMoveActions() {
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
        removeActionMenu(this.parentElement);
      }
    };
  }
}

function moveSelectUnits() {
  var selectedUnitsShapesToMove = getSelectedUnitsShapesToMove();
  var targetTile = this.childNodes;

  if (isBattleMovement(targetTile, selectedUnitsShapesToMove)) {
    resolveBattleMovement(targetTile, selectedUnitsShapesToMove);
  } else {
    resolvePeacefulMovement(targetTile, selectedUnitsShapesToMove);
  }
}

function getSelectedUnitsShapesToMove() {
  return document.getElementsByClassName('ACTIVE')[0]
  .parentElement
  .parentElement
  .childNodes[1]
  .getElementsByClassName('selected');
}

function getParentsFor(elements) {
  var arrayOfParents = [];
  for (var i = 0; i < elements.length; i++) {
    arrayOfParents.push(elements[i].parentElement);
  }
  return arrayOfParents;
}

function resolveBattleMovement(targetTile, selectedUnitsShapesToMove) {

  var attackingUnitsSvgElement = selectedUnitsShapesToMove[0].parentElement.parentElement;
  var defendingUnitsSvgElement = targetTile[0].parentElement.getElementsByTagName('svg')[0];

  var arrayOfAttackingUnits = getParentsFor(selectedUnitsShapesToMove);
  var arrayOfDefendingUnits = defendingUnitsSvgElement.getElementsByTagName('g');

  var defStr = calculateStrength(arrayOfDefendingUnits);
  var atkStr = calculateSelectedStrength(attackingUnitsSvgElement.childNodes);

  if (defStr > atkStr) {
    // defender wins
    killUnits(arrayOfAttackingUnits, attackingUnitsSvgElement, true, 0);
    killUnits(arrayOfDefendingUnits, defendingUnitsSvgElement, false, atkStr);
  } else if (defStr < atkStr) {
    // attacker wins
    killUnits(arrayOfDefendingUnits, defendingUnitsSvgElement, true, 0);
    var unitsToMoveIn = killUnits(arrayOfAttackingUnits, attackingUnitsSvgElement, false, defStr);
    for (var i = 0; i < unitsToMoveIn.length; i++) {
      moveToNonHostileTarget(defendingUnitsSvgElement, unitsToMoveIn[i]);
      resetUnit(unitsToMoveIn[i].getElementsByClassName('selected')[0]);
    }

    if (defendingUnitsSvgElement.parentElement.childElementCount == 2) {
      removeActionMenu(defendingUnitsSvgElement.parentElement.childNodes[0]);
    }
  } else {
    // draw
    killUnits(arrayOfAttackingUnits, attackingUnitsSvgElement, true, 0);
    killUnits(arrayOfDefendingUnits, defendingUnitsSvgElement, true, 0);
  }
}

function deleteChild(parentTile, unitsToKill) {
  parentTile.removeChild(unitsToKill[0]);
  //todo: investigate this tryCatch further, removeChild seems to update the last
  //todo: iteration of removing a element from unitsToKill, i've tried
  //todo: wrapping this in a if check for unitsToKill.length but its
  //todo: saying there is an element to be updated and splice is reporting
  //todo: otherwise
  try {
    unitsToKill.splice(0, 1);
  } catch (e) {
    console.log("Error Caught: " + e);
  }
}

function killUnits(unitsToKill, parentTile, killAll, damageTaken) {
  if (killAll) {
    while (unitsToKill.length > 0) {
      deleteChild(parentTile, unitsToKill);
    }
  } else {
    var valueOfUnitsKilled = 0;
    while (damageTaken > valueOfUnitsKilled) {
      var currentUnitValue = parseInt(unitsToKill[0].getElementsByTagName('text')[0].innerHTML) - 1;
      if (currentUnitValue == 0) {
        deleteChild(parentTile, unitsToKill);
      } else {
        unitsToKill[0].getElementsByTagName('text')[0].innerHTML = currentUnitValue;
      }
      valueOfUnitsKilled++;
    }
  }
  return unitsToKill;
}

function isBattleMovement(targetTile, selectedUnitsShapesToMove) {
  if (selectedUnitsShapesToMove.length == 0) {
    return false;
  } else if (tileHasUnits(targetTile[0])) {
    return (getRaceOfUnit(selectedUnitsShapesToMove) != getUnitsRaceInTargetTile(targetTile));
  }
  return false;
}

function getUnitsRaceInTargetTile(targetTile) {
  return targetTile[0].parentElement.getElementsByTagName('g')[0].childNodes[0].classList[0];
}

function getRaceOfUnit(selectedUnitsShapesToMove) {
  return selectedUnitsShapesToMove[0].classList[0];
}

function resolvePeacefulMovement(targetTile, selectedUnitsShapesToMove) {
  while (selectedUnitsShapesToMove.length > 0) {
    var shapeToMove = selectedUnitsShapesToMove[0];
    resetUnit(shapeToMove);

    if (tileHasUnits(targetTile[0])) {
      if (unitMergeRequired(targetTile[1], shapeToMove)) {
        mergeUnits(shapeToMove, targetTile[1]);
      } else {
        moveToNonHostileTarget(targetTile[1], shapeToMove.parentElement);
      }
    } else {
      moveToNonHostileTarget(targetTile[0], shapeToMove.parentElement);
    }
  }
}

function moveToNonHostileTarget(target, unit) {
  var oldTileUnits = unit.parentElement;
  target.appendChild(unit);
  if (oldTileUnits.childElementCount == 0) {
    removeActionMenu(oldTileUnits.parentElement.childNodes[0]);
  }
}

function removeActionMenu(menu) {
  var index = parseInt(menu.getElementsByTagName('input')[0].name.replace("menu-open", ""));
  menu.parentElement.removeChild(menu);
  highlightMoveOptions(index, false);
}

function resetUnit(shapeToMove) {
  shapeToMove.classList.remove('selected');
  removeOnClickEvent(shapeToMove.parentElement);
}

function mergeUnits(shapeToMove, targetTile) {
  var newForces = parseInt(shapeToMove.parentElement
  .getElementsByTagName('text')[0]
  .innerHTML);

  var existingForces = parseInt(targetTile
  .getElementsByTagName(shapeToMove.tagName)[0]
  .parentElement
  .getElementsByTagName('text')[0]
  .innerHTML);

  targetTile
  .getElementsByTagName(shapeToMove.tagName)[0]
  .parentElement
  .getElementsByTagName('text')[0]
  .innerHTML = newForces + existingForces;

  shapeToMove.parentElement.parentElement.removeChild(shapeToMove.parentElement);
}

function unitMergeRequired(tile, shapeToMove) {
  return (tile.getElementsByTagName(shapeToMove.tagName).length == 1);
}

function tileHasUnits(tileElement) {
  console.log("in tileHasUnits")
  return (tileElement.parentElement.getElementsByTagName('g').length > 0);
}