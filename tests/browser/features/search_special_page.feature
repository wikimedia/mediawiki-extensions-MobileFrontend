@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org @en.m.wikipedia.org
Feature: Search

  Scenario: Search from Uploads
    Given I am in beta mode
      And I go to uploads page
    When I click the placeholder search box
    Then I see the search overlay

  Scenario: Search from Watchlist
    Given I am in beta mode
      And I click on "Watchlist" in the main navigation menu
    When I click the placeholder search box
    Then I see the search overlay

  Scenario: Search from Nearby
    Given I am in beta mode
      And I click on "Nearby" in the main navigation menu
    When I click the placeholder search box
    Then I see the search overlay

  Scenario: Search from Login
    Given I am in beta mode
      And I click on "Log in" in the main navigation menu
    When I click the placeholder search box
    Then I see the search overlay
