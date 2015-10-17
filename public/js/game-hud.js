function changedHUDView(id_name) {
  function DisplayHudStatics(data) {
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
}