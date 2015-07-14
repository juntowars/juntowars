# Junto Wars

## Dependencies:

    - An instance of mongod needs to be running and configured in config.js
    
    - After which the setup/db_init.js script can be run to create the mongo schema
       $ mongo -h localhost junto < ./setup/db.init.js

## To run project:

    - Clone Repo
	
    - cd ./juntowars
	
    - npm install
	
    - npm start
    
## To run the tests:

 Juntowars uses Nightwatch.js as it's main testing tool.
    
    - The configuration for tests are defined in nightwatch.json
    
    - Before starting tests mongod must be running
    
    ..* In terminal, type the command _npm_ _run_ _test_env_ to start the test server
    ..* Then in another window type _npm_ _test_ 
  
    - When the tests are finished run _npm_ _run_ _stop_ to kill the mongod instance or _ctrl+c_ where the mongod instance is running

That's it you should be good to go:
    
    - Open *http://localhost:3000* in a Chrome browser