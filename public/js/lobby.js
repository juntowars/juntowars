window.onload = function () {

  var messages = [];
  var socket = io.connect(location.origin);
  var field = document.getElementById("field");
  var sendButton = document.getElementById("send");
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
    document.getElementById("startGameButton").disable = false;
  });

  socket.on('updateUsersList', function (userList) {
    if (userList) {
      for (var i = 0; i < userList.userList.length; i++) {
        var id = "player" + (i + 1).toString();
        document.getElementById(id).innerText = userList.userList[i];
        if (userList.userList[i] == name.value) {
          var tmp = document.getElementById(id + "row").innerHTML;
          document.getElementById(id + "row").innerHTML = '<input type="checkbox" id="readyButton"/> Are you Ready?<br/>';
        } else {
          document.getElementById(id + "row").innerText = id;
        }
      }

      var gameMaxPlayers = 6;
      if (userList.userList.length < gameMaxPlayers) {
        var emptySpacesToFill = gameMaxPlayers - userList.userList.length;
        for (i = gameMaxPlayers - emptySpacesToFill; i < gameMaxPlayers; i++) {
          id = "player" + (i + 1).toString();
          document.getElementById(id).innerText = 'Empty';
          document.getElementById(id + "row").innerText = id;
        }
      }
    } else {
      console.log("There is no user list to create table:", user);
    }
  });

  socket.on('playerReady', function (data) {

    function setPlayerReady(data) {
      if (data.user) {
        for (var i = 0; i < 6; i++) {
          var id = "player" + (i + 1).toString();
          var userToUpdate = document.getElementById(id).innerText;
          if (data.user == userToUpdate) {
            document.getElementById(id + "row").style.color = 'green';
          }
        }
      } else {
        console.log("There is no user information to change", user);
      }
    }

    function displayStartButton() {
        socket.emit('showStartButton', room);
    }

    setPlayerReady(data, displayStartButton);
  });

  sendButton.onclick = function () {
    socket.emit('send', room, {message: field.value, username: name.value});
    $('#field').val('');
  };

  $(document).on('click', '#readyButton', function () {
    socket.emit('userReady', room, name.value);
    document.getElementById("readyButton").disabled = true;
  });

  $('#field').keydown(function (event) {
    if (event.keyCode == 13) {
      $('#send').trigger('click');
    }
  });

};
