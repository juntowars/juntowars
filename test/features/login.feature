Feature: testing Login
  For this test suite we will test a number of scenarios related to login

  @wip
  Scenario: User attempts to login with incorrect details
    Given User visits login screen
    When User attempts to login with email 'fake_email@test.com' and password 'test'
    Then The user sees error message 'Invalid email or password'

  Scenario: Valid user details are used to log in successfully
    Given User visits login screen
    When User attempts to login with email 'valid_email@test.com' and password 'test'
    Then The user is redirected to the home screen
    And The Nav Bar now has the headers 'Games', 'Profile' and 'Logout'





