function lockInAction(element, icon, action, index) {
  var middleIcon = element.parentElement.getElementsByClassName('action-display')[0];
  middleIcon.classList.add(icon);
  middleIcon.classList.remove('fa-plus');

  var checkBox = element.parentElement.getElementsByClassName('menu-open')[0];
  checkBox.disabled = true;
  checkBox.checked = false;

  var menuOpenButton = element.parentElement.getElementsByClassName('menu-open-button')[0];
  menuOpenButton.style.background = "green";

  game_socket.emit('lockInOrder', action, playerName, gameRoom, index);

  if (document.getElementsByClassName('fa-plus').length == 0) game_socket.emit('allOrdersAreSet', gameRoom, playerName);
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
  var allTileElements = document.getElementsByClassName('hex');
  var neighbouringTiles = index % 2 ? [-1, +1, -24, 23, 24, 25] : [-1, +1, -23, -24, -25, 24];

  for (var i = 0; i < neighbouringTiles.length; i++) {
    var hex = allTileElements[index + neighbouringTiles[i]];
    if (hex.className != "hex water") {
      turnOn ? hex.classList.add("highlight") : hex.classList.remove("highlight");
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

function enableMoveActions(userToEnableMovesFor, playerName) {

  if (userToEnableMovesFor == playerName) {
    var listOfMoves = document.getElementsByClassName('action-display fa-arrow-right');
    for (var i = 0; i < listOfMoves.length; i++) {
      var movementAction = listOfMoves[i];
      movementAction.parentElement.style.background = 'orange';
      movementAction.parentElement.onclick = function () {

        //Mark as active
        var activeTileInputTag = this.parentElement.getElementsByTagName('input')[0];
        var index = parseInt(activeTileInputTag.attributes.name.value.replace("menu-open", ""));
        this.classList.add('ACTIVE');

        // Reset other tiles
        for (var i = 0; i < listOfMoves.length; i++) {
          var notSelected = !listOfMoves[i].parentElement.classList.contains('ACTIVE');
          if (notSelected) {
            listOfMoves[i].parentElement.style.background = 'green';
            removeOnClickEvent(listOfMoves[i].parentElement);
          }
        }
        //Handle move
        handleMoveAction(index, this, true);

        //End move with second click
        this.onclick = function () {
          handleMoveAction(index, this, false);
          removeActionMenu(this.parentElement);
        }
      };
    }
  } else {
    displayModal("Hold onto your butts", "Waiting on " + userToEnableMovesFor + " to place a move");
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
    defenderWins(arrayOfAttackingUnits, attackingUnitsSvgElement, arrayOfDefendingUnits, defendingUnitsSvgElement, atkStr);
  } else if (defStr < atkStr) {
    attackerWins(arrayOfDefendingUnits, defendingUnitsSvgElement, arrayOfAttackingUnits, attackingUnitsSvgElement, defStr);
  } else {
    itsADraw(arrayOfAttackingUnits, attackingUnitsSvgElement, arrayOfDefendingUnits, defendingUnitsSvgElement);
  }
}

function itsADraw(arrayOfAttackingUnits, attackingUnitsSvgElement, arrayOfDefendingUnits, defendingUnitsSvgElement) {
  killUnits(arrayOfAttackingUnits, attackingUnitsSvgElement, true, 0);
  killUnits(arrayOfDefendingUnits, defendingUnitsSvgElement, true, 0);
  if (noUnitsRemaining(defendingUnitsSvgElement)) {
    removeActionMenu(defendingUnitsSvgElement.parentElement.childNodes[0]);
  }
  if (noUnitsRemaining(attackingUnitsSvgElement)) {
    removeActionMenu(attackingUnitsSvgElement.parentElement.childNodes[0]);
  }
}

function attackerWins(arrayOfDefendingUnits, defendingUnitsSvgElement, arrayOfAttackingUnits, attackingUnitsSvgElement, defStr) {
  killUnits(arrayOfDefendingUnits, defendingUnitsSvgElement, true, 0);
  var unitsToMoveIn = killUnits(arrayOfAttackingUnits, attackingUnitsSvgElement, false, defStr);
  for (var i = 0; i < unitsToMoveIn.length; i++) {
    moveToNonHostileTarget([defendingUnitsSvgElement], unitsToMoveIn[i]);
    removeSelectedState(unitsToMoveIn[i].getElementsByClassName('selected')[0]);
  }

  if (defendingUnitsSvgElement.parentElement.childElementCount == 2) {
    removeActionMenu(defendingUnitsSvgElement.parentElement.childNodes[0]);
  }
}

function defenderWins(arrayOfAttackingUnits, attackingUnitsSvgElement, arrayOfDefendingUnits, defendingUnitsSvgElement, atkStr) {
  killUnits(arrayOfAttackingUnits, attackingUnitsSvgElement, true, 0);
  killUnits(arrayOfDefendingUnits, defendingUnitsSvgElement, false, atkStr);
  if (noUnitsRemaining(attackingUnitsSvgElement)) {
    removeActionMenu(attackingUnitsSvgElement.parentElement.childNodes[0]);
  }
}

function noUnitsRemaining(svgElement) {
  return svgElement.childElementCount == 0 && svgElement.parentElement.childElementCount == 2;
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
  } else if (tileHasUnits(targetTile)) {
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
    removeSelectedState(shapeToMove);

    if (tileHasUnits(targetTile)) {
      if (unitMergeRequired(targetTile, shapeToMove)) {
        mergeUnits(shapeToMove, targetTile);
      } else {
        moveToNonHostileTarget(targetTile, shapeToMove.parentElement);
      }
    } else {
      moveToNonHostileTarget(targetTile, shapeToMove.parentElement);
    }
  }
}

function moveToNonHostileTarget(target, unit) {
  var originTile = unit.parentElement;

  // persist movement
  var originIndex = getIndexValue(originTile);
  var targetIndex = getIndexValue(target[0]);
  var unitType = getUnitType(unit);
  var unitValue = getUnitValue(unit);
  var unitRace = getUnitRace(unit);
  game_socket.emit('peacefulMove', gameRoom, originIndex, targetIndex, unitType, unitValue, unitRace);

  target[0].parentElement.getElementsByTagName('svg')[0].appendChild(unit);
  if (originTile.childElementCount == 0) {
    removeActionMenu(originTile.parentElement.childNodes[0]);
  }
}

function removeActionMenu(menu) {
  var activeMenu = menu.getElementsByTagName('label')[0].classList.contains('ACTIVE');
  var index = parseInt(menu.getElementsByTagName('input')[0].name.replace("menu-open", ""));
  menu.parentElement.removeChild(menu);
  if (activeMenu) {
    highlightMoveOptions(index, false);
  }
}

function removeSelectedState(shapeToMove) {
  shapeToMove.classList.remove('selected');
  removeOnClickEvent(shapeToMove.parentElement);
}

function mergeUnits(shapeToMove, targetTile) {
  var newForces = parseInt(shapeToMove.parentElement
  .getElementsByTagName('text')[0]
  .innerHTML);

  var existingForces = parseInt(targetTile[0].parentElement
  .getElementsByTagName(shapeToMove.tagName)[0]
  .parentElement
  .getElementsByTagName('text')[0]
  .innerHTML);

  targetTile[0].parentElement
  .getElementsByTagName(shapeToMove.tagName)[0]
  .parentElement
  .getElementsByTagName('text')[0]
  .innerHTML = newForces + existingForces;

  shapeToMove.parentElement.parentElement.removeChild(shapeToMove.parentElement);
}

function unitMergeRequired(tile, shapeToMove) {
  return (tile[0].parentElement.getElementsByTagName(shapeToMove.tagName).length == 1);
}

function tileHasUnits(tileElement) {
  return (tileElement[0].parentElement.getElementsByTagName('g').length > 0);
}

function displayModal(heading, text) {
  var races = ["kingdomWatchers", "periplaneta"];

  if (races.indexOf(heading) > -1) {
    function loadJSON(callback) {
      var http = new XMLHttpRequest();
      http.overrideMimeType("application/json");
      http.open('GET', location.origin + '/getRaceHistory/' + heading, true);
      http.onload = function () {
        if (http.readyState == 4 && http.status == "200") {
          callback(http.responseText);
        }
      };
      http.send();
    }

    loadJSON(function (response) {
      var actual_JSON = JSON.parse(response);
      heading = actual_JSON.header;
      text = actual_JSON.text;
      populateModal();
    });

  } else{
    populateModal();
  }
  function populateModal() {
    document.getElementById('nextActionModalHeading').innerHTML = heading;
    document.getElementById('nextActionModalText').innerHTML = text;
    document.getElementById('nextActionModal').classList.add('show');
    document.getElementById('nextActionModal').onclick = function () {
      document.getElementById('nextActionModal').classList.remove('show');
    };
  }
}

function getXValue(element) {
  return parseInt(element.parentElement.id.replace("x_", ""));
}

function getYValue(element) {
  return parseInt(element.parentElement.parentElement.id.replace("y_", ""));
}

function getIndexValue(element) {
  return getXValue(element) + (getYValue(element) * 24);
}

function getUnitType(element) {
  return element.childNodes[0].classList[1];
}

function getUnitRace(element) {
  return element.childNodes[0].classList[0];
}

function getUnitValue(element) {
  return parseInt(element.childNodes[1].textContent);
}



