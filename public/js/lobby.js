window.onload = function () {

  var messages = [];
  var socket = io.connect(location.origin);
  var field = document.getElementById("field");
  var readyButton = document.getElementById("readyButton");
  var startGameButton = document.getElementById("startGameButton");
  var content = document.getElementById("content");
  var name = document.getElementById("name");
  var room = window.location.pathname.replace(/.*\//, '');

  socket.emit('create', room, name.value);

  socket.on('message', function (data) {
    if (data.message) {
      messages.push(data);
      var html = '';
      for (var i = 0; i < messages.length; i++) {
        html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
        html += messages[i].message + '<br />';
      }
      content.innerHTML = html;
    } else {
      console.log("There is a problem:", data);
    }
  });

  socket.on('displayStartButton', function () {
    document.getElementById("startGameButton").innerHTML = '<a class="btn btn-primary" id="initGameButton">Start</a>';
  });

  socket.on('refreshLobbyStatus', function (data) {
    if (data) {
      var listOfUsers = data.playerStatus;
      // Fill out the data we have
      for (var i = 0; i < listOfUsers.length; i++) {
        var playerNum = "player" + (i + 1).toString();
        // Display users name
        document.getElementById(playerNum).innerText = listOfUsers[i].uuid;
        // Display users Status
        var playerStatus = playerNum;
        if (listOfUsers[i].uuid == name.value ) {
          playerStatus =  '<input type="checkbox" id="readyButton"/> Are you Ready?<br/>';
          if(listOfUsers[i].ready) playerStatus = '<p style="color: green">IM READY</p>';
          document.getElementById(playerNum + "row").innerHTML = playerStatus;
        } else {
          // Other player
          if(listOfUsers[i].ready) playerStatus = '<p style="color: green">PLAYER READY</p>';
          document.getElementById(playerNum + "row").innerHTML = playerStatus;
        }
      }

      // Pad out the rest with place holders if needed
      var gameMaxPlayers = 6;
      if (data.playerStatus.length < gameMaxPlayers) {
        for (i = data.playerStatus.length; i < gameMaxPlayers; i++) {
          playerNum = "player" + (i + 1).toString();
          document.getElementById(playerNum).innerText = 'Empty';
          document.getElementById(playerNum + "row").innerText = playerNum;
        }
      }
    } else {
      console.log("There is no user list to create table:", data);
    }
  });

  socket.on('redirect', function () {
    window.location.href = location.origin + "/games/view/"+room;
  });

  $(document).on('click', '#send', function () {
    socket.emit('send', room, {message: field.value, username: name.value});
    $('#field').val('');
  });
  $(document).on('click', '#readyButton', function () {
    socket.emit('userReady', room, name.value);
    document.getElementById("readyButton").disabled = true;
  });
  $(document).on('click', '#initGameButton', function () {
    socket.emit('startGame', room, name.value);
  });
  $(document).on('keydown', '#field', function () {
    if (event.keyCode == 13) {
      $('#send').trigger('click');
    }
  });
};
