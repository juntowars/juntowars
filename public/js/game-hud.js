function changedHUDView(id_name) {

  function DisplayHud() {
    var hudDisplay = document.getElementById(id_name);

    if (hudDisplay.classList.contains('activeHud')) {
      hudDisplay.classList.remove('activeHud');
      hudDisplay.classList.add('hudContainer');
    } else {
      var activeHud = document.getElementsByClassName('activeHud')[0];
      if (activeHud) {
        activeHud.classList.remove('activeHud');
        activeHud.classList.add('hudContainer');
      }
      hudDisplay.classList.remove('hudContainer');
      hudDisplay.classList.add('activeHud');
    }
  }

  GetHudStatistics(DisplayHud);
}

function updateUnitsStrength(data) {
  document.getElementById('tank_units_hud').innerHTML = data.tank;
  document.getElementById('infantry_units_hud').innerHTML = data.infantry;
  document.getElementById('ranged_units_hud').innerHTML = data.ranged;
}

function addHudListeners() {
  document.getElementById('game_hud_tab').onclick = function () {
    changedHUDView('game_hud');
  };
  document.getElementById('game_hud_deployment_tab').onclick = function () {
    changedHUDView('game_hud_deploy');
  };
}

function removeFromDeploymentResources(valueToRemove) {
  var defaultDeploymentValue = parseInt(document.getElementById('default-deployment-value').textContent);
  var harvestValue = parseInt(document.getElementById('harvest-value').textContent);

  if (defaultDeploymentValue >= valueToRemove){
    document.getElementById('default-deployment-value').textContent = String(defaultDeploymentValue - valueToRemove);
  } else {
    document.getElementById('default-deployment-value').textContent = "0";
    document.getElementById('harvest-value').textContent =  String((harvestValue + defaultDeploymentValue) - valueToRemove);
  }
}

function addToDeploymentResources(valueToAdd){
  var harvestValue = parseInt(document.getElementById('harvest-value').textContent);
  document.getElementById('harvest-value').textContent =  String(harvestValue + valueToAdd);
}


function toggleDeploymentSubPanelButtons(activateButtons) {
  if (activateButtons) {
    document.getElementById("inc-tank").onclick = function () {
      var tankCost = 2;
      var defaultDeploymentValue = parseInt(document.getElementById('default-deployment-value').textContent);
      var harvestValue = parseInt(document.getElementById('harvest-value').textContent);
      var tankCount = parseInt(document.getElementById("tank-value").textContent);

      if ((tankCount + 1 <= 10) && ( (harvestValue + defaultDeploymentValue) >= tankCost )) {
        removeFromDeploymentResources(tankCost);
        document.getElementById("tank-value").textContent = String(tankCount + 1);
      }
    };
    document.getElementById("dec-tank").onclick = function () {
      var tankCost = 2;
      var tankCount = parseInt(document.getElementById("tank-value").textContent);
      if ((tankCount - 1 >= 0)) {
        addToDeploymentResources(tankCost);
        document.getElementById("tank-value").textContent = String(tankCount - 1);
      }
    };
    document.getElementById("inc-ranged").onclick = function () {
      var rangedCost = 1;
      var defaultDeploymentValue = parseInt(document.getElementById('default-deployment-value').textContent);
      var harvestValue = parseInt(document.getElementById('harvest-value').textContent);
      var rangedCount = parseInt(document.getElementById("ranged-value").textContent);
      if ((rangedCount + 1 <= 10) && ( (harvestValue + defaultDeploymentValue) >= rangedCost )) {
        removeFromDeploymentResources(rangedCost);
        document.getElementById("ranged-value").textContent = String(rangedCount + 1);
      }
    };
    document.getElementById("dec-ranged").onclick = function () {
      var rangedCost = 1;
      var rangedCount = parseInt(document.getElementById("ranged-value").textContent);
      if (rangedCount - 1 >= 0) {
        addToDeploymentResources(rangedCost);
        document.getElementById("ranged-value").textContent = String(rangedCount - 1);
      }
    };
    document.getElementById("inc-infantry").onclick = function () {
      var infantryCost = 1;
      var defaultDeploymentValue = parseInt(document.getElementById('default-deployment-value').textContent);
      var harvestValue = parseInt(document.getElementById('harvest-value').textContent);
      var infantryCount = parseInt(document.getElementById("infantry-value").textContent);
      if ((infantryCount + 1 <= 10)  && ( (harvestValue + defaultDeploymentValue) >= infantryCost )) {
        removeFromDeploymentResources(infantryCost);
        document.getElementById("infantry-value").textContent = String(infantryCount + 1);
      }
    };
    document.getElementById("dec-infantry").onclick = function () {
      var infantryCost = 1;
      var infantryCount = parseInt(document.getElementById("infantry-value").textContent);
      if (infantryCount - 1 >= 0) {
        addToDeploymentResources(infantryCost);
        document.getElementById("infantry-value").textContent = String(infantryCount - 1);
      }
    };
  } else {
    document.getElementById("inc-tank").onclick = null;
    document.getElementById("dec-tank").onclick = null;
    document.getElementById("inc-ranged").onclick = null;
    document.getElementById("dec-ranged").onclick = null;
    document.getElementById("inc-infantry").onclick = null;
    document.getElementById("dec-infantry").onclick = null;
  }
}

function displayDeployTab(deployData){
  document.getElementById('game_hud_deployment_tab').style.display = 'block';
  changedHUDView('game_hud_deploy');
  toggleDeploymentSubPanelButtons(true);

  var playerRace = getPlayersRace();
  document.getElementById('default-deployment-value').innerHTML = deployData[playerRace].defaultDeployment;
}