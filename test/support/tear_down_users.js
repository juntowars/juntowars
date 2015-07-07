db.games.drop();

for(var dummyUser = 1; dummyUser <= 7; dummyUser ++) {
  db.users.remove({"name" : "valid_user_" + dummyUser});
}
