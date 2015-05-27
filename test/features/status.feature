Feature: Health check on current server status

  Scenario: Server status is ok
    Given The server is running in 'development' environment
    When I send a request to the server using the status endpoint
    Then I get http status 200
    And The current environment should be 'development'

