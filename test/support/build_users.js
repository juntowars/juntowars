db.users.insert({
"authToken" : "",
"salt" : "1076403035111",
"hashed_password" : "83a59a48ce5b3bebc1cf312f3304edbde0699a64",
"username" : "3",
"email" : "3@test.com",
"name" : "valid_user_3"
});
db.users.insert({
"authToken" : "",
"salt" : "1242267736598",
"hashed_password" : "52d527d946bb95b66049d24b3e204c12494c21d9",
"username" : "7",
"email" : "7@test.com",
"name" : "valid_user_7"
});
db.users.insert({
"authToken" : "",
"salt" : "644742999742",
"hashed_password" : "fa3ba71c9c244e14ea76bd9973993a9a86665321",
"username" : "5",
"email" : "5@test.com",
"name" : "valid_user_5"
});
db.users.insert({
"authToken" : "",
"salt" : "1042298781279",
"hashed_password" : "73cd72472f185363b535d1721f55db5d238c9339",
"username" : "1",
"email" : "1@test.com",
"name" : "valid_user_1"
});
db.users.insert({
"authToken" : "",
"salt" : "1369592815232",
"hashed_password" : "b9bf21ba84c5232ebc4877a648e986b44c6255fd",
"username" : "6",
"email" : "6@test.com",
"name" : "valid_user_6"
});
db.users.insert({
  "authToken": "",
  "salt": "525500939029",
  "hashed_password": "23b506fef7dd462beeca85d0990d7e8f1371319c",
  "username": "4",
  "email": "4@test.com",
  "name": "valid_user_4"
});
db.users.insert({
"authToken" : "",
"salt" : "545316042787",
"hashed_password" : "8ef6d808d30a81f219a07e2b210c62ace66d1d9b",
"username" : "2",
"email" : "2@test.com",
"name" : "valid_user_2"
});

db.games.insert({
  "adminUser" : "1",
  "lobby" : {
    "playerStatus" : [
      {
        "ready" : true,
        "uuid" : "2"
      },
      {
        "ready" : true,
        "uuid" : "3"
      },
      {
        "ready" : true,
        "uuid" : "4"
      },
      {
        "ready" : true,
        "uuid" : "5"
      },
      {
        "ready" : true,
        "uuid" : "6"
      }
    ],
    "status" : "open"
  },
  "publicJoin" : true,
  "gameLog" : [ ],
  "chatLog" : [ ],
  "userList" : {
    "guardians" : "",
    "reduviidae" : "",
    "periplaneta" : "",
    "kingdomWatchers" : "",
    "settlers" : "",
    "geoEngineers" : "",
    "uuids" : [ ]
  },
  "state" : {
    "nextToMove" : "",
    "phase" : "1",
    "round" : 1
  },
  "name" : "test"
});