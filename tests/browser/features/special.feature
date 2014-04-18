@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org @en.m.wikipedia.org
Feature: Generic special page features

  Scenario: Search from Uploads
    Given I click on "Uploads" in the main navigation menu
    When I click the placeholder search box
    Then I see the search overlay

  Scenario: Search from Watchlist
    Given I click on "Watchlist" in the main navigation menu
    When I click the placeholder search box
    Then I see the search overlay

  Scenario: Search from Nearby
    Given I click on "Nearby" in the main navigation menu
    When I click the placeholder search box
    Then I see the search overlay

  Scenario: Search from Login
    Given I click on "Log in" in the main navigation menu
    When I click the placeholder search box
    Then I see the search overlay
