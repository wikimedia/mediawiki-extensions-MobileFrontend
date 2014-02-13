@en.m.wikipedia.beta.wmflabs.org @test2.m.wikipedia.org
Feature: Search

  Scenario: Search from Uploads
    Given I am in beta mode
      And I go to uploads page
    When I click the placeholder search box
    Then I see the search overlay

  Scenario: Search from Watchlist
    Given I am in beta mode
      And I select Watchlist
    When I click the placeholder search box
    Then I see the search overlay

  Scenario: Search from Nearby
    Given I am in beta mode
      And I navigate to the nearby page
    When I click the placeholder search box
    Then I see the search overlay

  Scenario: Search from Login
    Given I am in beta mode
      And I go to the login page
    When I click the placeholder search box
    Then I see the search overlay
