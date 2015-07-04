db.games.remove({"name": "test"});

for(var dummyUser = 1; dummyUser <= 7; dummyUser ++) {
  db.users.remove({"username" : "valid_user_" + dummyUser});
}
