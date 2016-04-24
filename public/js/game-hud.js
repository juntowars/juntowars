function changedHUDView(id_name) {

  function DisplayHudStatics() {
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

  GetHudStatistics(DisplayHudStatics);
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

function displayDeployTab(){
}

function toggleDeploymentPanel() {
  var panel = document.getElementById("deployment-panel-id");
  var expander = document.getElementById("deployment-panel-expander-id");
  var subPanelOne = document.getElementById("sub-panel-1");
  var subPanelTwo = document.getElementById("sub-panel-2");
  var subPanelThree = document.getElementById("sub-panel-3");

  if (panel.classList.contains("deployment-panel-open")) {
    toggleDeploymentSubPanel(subPanelOne, false);
    toggleDeploymentSubPanel(subPanelTwo, false);
    toggleDeploymentSubPanel(subPanelThree, false);

    panel.classList.remove("deployment-panel-open");
    panel.classList.add("deployment-panel-closed");

    expander.classList.remove("rotate");
    expander.classList.add("un_rotate");

    setTimeout(function () {
      expander.classList.remove("fa-minus");
      expander.classList.remove("fa-2x");
      expander.classList.add("fa-plus");
    }, 400);
  } else {
    //OPENING IT
    panel.classList.remove("deployment-panel-closed");
    panel.classList.add("deployment-panel-open");

    setTimeout(function () {
      expander.classList.remove("fa-plus");
      expander.classList.add("fa-2x");
      expander.classList.add("fa-minus");
    }, 400);
    expander.classList.remove("un_rotate");
    expander.classList.add("rotate");

    toggleDeploymentSubPanel(subPanelOne, true);
    toggleDeploymentSubPanel(subPanelTwo, true);
    toggleDeploymentSubPanel(subPanelThree, true);
    toggleDeploymentSubPanelButtons(true);
  }
}

function toggleDeploymentSubPanel(element, turnOn) {
  if (turnOn) {
    setTimeout(function () {
      element.classList.remove("hidden-panel");
      element.classList.add("show-panel");
    }, 1000);
  } else {
    element.classList.remove("show-panel");
    element.classList.add("hidden-panel");
  }
}

function toggleDeploymentSubPanelButtons(activateButtons) {
  if (activateButtons) {
    document.getElementById("inc-tank").onclick = function () {
      var tankCount = parseInt(document.getElementById("tank-value").textContent);
      if (tankCount + 1 <= 10) {
        document.getElementById("tank-value").textContent = String(tankCount + 1);
      }
    };
    document.getElementById("dec-tank").onclick = function () {
      var tankCount = parseInt(document.getElementById("tank-value").textContent);
      if (tankCount - 1 >= 0) {
        document.getElementById("tank-value").textContent = String(tankCount - 1);
      }
    };
    document.getElementById("inc-ranged").onclick = function () {
      var rangedCount = parseInt(document.getElementById("ranged-value").textContent);
      if (rangedCount + 1 <= 10) {
        document.getElementById("ranged-value").textContent = String(rangedCount + 1);
      }
    };
    document.getElementById("dec-ranged").onclick = function () {
      var rangedCount = parseInt(document.getElementById("ranged-value").textContent);
      if (rangedCount - 1 >= 0) {
        document.getElementById("ranged-value").textContent = String(rangedCount - 1);
      }
    };
    document.getElementById("inc-infantry").onclick = function () {
      var infantryCount = parseInt(document.getElementById("infantry-value").textContent);
      if (infantryCount + 1 <= 10) {
        document.getElementById("infantry-value").textContent = String(infantryCount + 1);
      }
    };
    document.getElementById("dec-infantry").onclick = function () {
      var infantryCount = parseInt(document.getElementById("infantry-value").textContent);
      if (infantryCount - 1 >= 0) {
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