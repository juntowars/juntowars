# Junto Wars

Dependencies:

    - An instance of mongod needs to be running and configured in config.js
    
    - After which the setup/db_init.js script can be run to create the mongo schema
       $ mongo -h localhost junto < ./setup/db.init.js

To run project:

    - Clone Repo
	
    - cd ./juntowars
	
    - npm install
	
    - npm start
    
Tests are running with Nightwatch.js, using the selenium standalone server
    
    - Download the Chromedriver and Selenium-Standalone-Server and save them into the /lib/external_tools folder
  
    - update nightwatch.json with the version of Chromedriver and selenium you are using
  
    - run npm test to run all current tests

That's it you should be good to go:
    
    - Open http://localhost:3000 in a Chrome browser