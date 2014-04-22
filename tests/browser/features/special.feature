@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org @en.m.wikipedia.org
Feature: Generic special page features

  Background:
    Given I am on the "Main Page" page

  Scenario: Search from Uploads
    When I click on "Uploads" in the main navigation menu
      And I click the placeholder search box
    Then I see the search overlay

  Scenario: Search from Watchlist
    When I click on "Watchlist" in the main navigation menu
      And I click the placeholder search box
    Then I see the search overlay

  Scenario: Search from Nearby
    When I click on "Nearby" in the main navigation menu
      And I click the placeholder search box
    Then I see the search overlay

  Scenario: Search from Login
    When I click on "Log in" in the main navigation menu
      And I click the placeholder search box
    Then I see the search overlay
