Feature: Health check on current server status

  Scenario: Server status is ok
    When I send a request to the server using the status endpoint
    Then I get a message "ok"
    And A HTTP status code of 200

