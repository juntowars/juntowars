function changedHUDView(id_name) {
  function DisplayHudStatics(data) {
    //set hudDisplay
    var hudDisplay = document.getElementById(id_name);

    if (hudDisplay.classList.contains('activeHud')) {
      hudDisplay.classList.remove('activeHud');
      hudDisplay.classList.add('hudContainer');
    } else {
      var activeHud = document.getElementsByClassName('activeHud')[0];
      if(activeHud){
        activeHud.classList.remove('activeHud');
        activeHud.classList.add('hudContainer');
      }
      hudDisplay.classList.remove('hudContainer');
      hudDisplay.classList.add('activeHud');
    }

    if (hudDisplay.id == 'units') {
      updateUnitsStrength(data, 'units_hud');
    }
  }
  GetHudStatistics(DisplayHudStatics);
}


function updateUnitsStrength(data, hud_id) {
  document.getElementById('tank_' + hud_id).innerHTML = data.tank;
  document.getElementById('infantry_' + hud_id).innerHTML = data.infantry;
  document.getElementById('ranged_' + hud_id).innerHTML = data.ranged;
}

function addHudListeners() {
  document.getElementById('units_tab').onclick = function () {
    changedHUDView('units_hud');
  };
  document.getElementById('game_progress_tab').onclick = function () {
    changedHUDView('game_progress_hud');
  };

  document.getElementById('player_display_tab').onclick = function () {
    changedHUDView('player_display_hud');
  };
}

