@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org
Feature: Manage Watchlist

  Background:
    Given I create a random page using the API
      And I am logged into the mobile website
      And I am on the random page
      And the page is unwatched

  Scenario: Add an article to the watchlist
    When I click the watch star
    Then I see a toast notification
      And I see a toast with message about adding the random page
      And The watch star is selected

  Scenario: Remove an article from the watchlist
    When I click the watch star
      And I click the unwatch star
    Then I see a toast notification
      And I see a toast with message about removing the random page
      And The watch star is not selected
