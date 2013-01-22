Feature: Manage Watchlist

  Background:
    Given I am in beta mode
      And I am logged into the mobile website

  Scenario: Add an article to the watchlist
    When I search for an article and select the watchlist icon
    Then I receive notification that the article has been added to the watchlist
      And the article watchlist icon is selected

  Scenario: Remove an article from the watchlist
    When I search for an article and select the watchlist icon
    Then I receive notification that the article has been removed from the watchlist
      And the article no longer has the watchlist icon selected
