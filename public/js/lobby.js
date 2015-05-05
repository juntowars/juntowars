window.onload = function () {

    var messages = [];
    var socket = io.connect(location.origin);
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
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

    socket.on('userJoined', function (userList) {
        if (userList) {
            var html = '';
            for (var i = 0; i < userList.length; i++) {
                html += '<b>' + userList[i] + ': </b>';
            }
            users.innerHTML = html + '<br />';
        } else {
            console.log("There is a problem:", user);
        }
    });

    sendButton.onclick = function () {
        socket.emit('send', room, {message: field.value, username: name.value});
        $('#field').val('');
    };

    $('#field').keydown(function(event){
        if(event.keyCode==13){
            $('#send').trigger('click');
        }
    });

};
