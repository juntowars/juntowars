Feature: Signup

  Scenario: Successful user sign up
    Given User visits the signup page
    When The user enters the name "", email "", password "", and username ""
    Then The user is successfully logged in

  Scenario: Invalid name
    Given User visits the signup page
    When The user enters the name "", email "", password "", and username ""

  Scenario: Invalid email
    Given User visits the signup page
    When The user enters the name "", email "", password "", and username ""

  Scenario: Invalid password
    Given User visits the signup page
    When The user enters the name "", email "", password "", and username ""

  Scenario: Invalid username
    Given User visits the signup page
    When The user enters the name "", email "", password "", and username ""