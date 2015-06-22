window.onload = function () {

  var messages = [];
  var socket = io.connect(location.origin);
  var field = document.getElementById("field");
  var sendButton = document.getElementById("send");
  var readyButton = document.getElementById("readyButton");
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

  socket.on('updateUsersList', function (userList) {
    if (userList) {
      for (var i = 0; i < userList.userList.length; i++) {
        var id = "player" + (i + 1).toString();
        document.getElementById(id).innerHTML = '<p>' + userList.userList[i] + '</p>';

        if(userList.userList[i] == name.value){
          document.getElementById(id+"row").innerHTML = '<input type="checkbox" id="readyButton"/> Ready?<br/>';
        } else {
          document.getElementById(id+"row").innerHTML = '<p>'+id+'</p>';
        }

      }

      var gameMaxPlayers = 6;
      if (userList.userList.length < gameMaxPlayers) {
        var emptySpacesToFill = gameMaxPlayers - userList.userList.length;
        for ( i = gameMaxPlayers - emptySpacesToFill; i < gameMaxPlayers; i++) {
          id = "player" + (i + 1).toString();
          document.getElementById(id).innerHTML = '<p>Empty</p>';
          document.getElementById(id+"row").innerHTML = '<p>'+id+'</p>';
        }
      }
    } else {
      console.log("There is a problem:", user);
    }
  });

  sendButton.onclick = function () {
    socket.emit('send', room, {message: field.value, username: name.value});
    $('#field').val('');
  };


  $(document).on('click','#readyButton',function() {
    socket.emit('userReady', room, name.value);
  });


  $('#field').keydown(function (event) {
    if (event.keyCode == 13) {
      $('#send').trigger('click');
    }
  });

};
