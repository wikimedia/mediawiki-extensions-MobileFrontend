Feature: Manage Watchlist

  Background:
    Given I am in beta mode

  Scenario: I receive notification that I need to log in to use the watchlist functionality
      And I am not logged in
    When Select the watchlist icon
    Then I receive notification that I need to log in to use the watchlist functionality

  Scenario: Login link leads to login page
      And I am not logged in
    When Select the watchlist icon
      And I click Login
    Then Login page opens

  Scenario: Add an article to the watchlist
    And I am logged into the mobile website
    When I search for an article and select the watchlist icon
    Then I receive notification that the article has been added to the watchlist
      And the article watchlist icon is selected

  Scenario: Remove an article from the watchlist
    And I am logged into the mobile website
    When I search for an article and select the watchlist icon
    Then I receive notification that the article has been removed from the watchlist
      And the article no longer has the watchlist icon selected
