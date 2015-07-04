db.games.insert({"name": "test"});

for(var dummyUser = 1; dummyUser <= 7; dummyUser ++) {
  db.users.insert({"username" : "valid_user_" + dummyUser, "email" : dummyUser + "@test.com", "name" : "" + dummyUser, "password": "" + dummyUser });
}
