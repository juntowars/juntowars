# Junto Wars

## Dependencies:

    - An instance of mongod needs to be running and configured in config.js
    
    - After which the setup/db_init.js script can be run to create the mongo schema
       $ mongo -h localhost junto < ./setup/db.init.js

## To run project:

    - Clone Repo
	
    - cd ./juntowars
    
    - mongod  --dbpath /var/mongo
    	
    - npm install
	
    - npm start

## Testing
 
   - Juntowars uses Nightwatch.js as it's main testing tool.
     
   - The configuration for tests are defined in nightwatch.json
     
   - Before starting tests mongod must be running
    
## To run the tests:
    
    - npm run test_env  
    
    - npm test 
    
    - npm run stop 

That's it you should be good to go:
    
    - Open *http://localhost:3000* in a Chrome browser