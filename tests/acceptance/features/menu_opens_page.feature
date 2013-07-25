Feature: Menus open correct page
  
  Background:
    Given I am on the home page
    
  Scenario: Home URL is set correctly
    When I click on Home from the left Nav
    Then my URL should be set to the Home Page

  Scenario: Random URL is set correctly
    When I click on Random from the left Nav
    Then my URL should be set to the Random Page

  Scenario: Nearby URL is set correctly
    When I click on Nearby from the left Nav
    Then my URL should be set to the Nearby Page

  Scenario: Watchlist URL is set correctly
    When I click on Watchlist from the left Nav
    Then my URL should be set to the Watchlist Page

  Scenario: Uploads URL is set correctly
    When I click on Uploads from the left Nav
    Then my URL should be set to the Uploads Page

  Scenario: Settings URL is set correctly
    When I click on Settings from the left Nav
    Then my URL should be set to the Settings Page

  Scenario: Log In URL is set correctly
    When I click on Log In from the left Nav
    Then my URL should be set to the Log In Page





