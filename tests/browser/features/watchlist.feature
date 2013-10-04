Feature: Manage Watchlist

  Scenario: I receive notification that I need to log in to use the watchlist functionality
    Given I am on the home page
      And I am not logged in
    When I select the watchlist icon
    Then I receive notification that I need to log in to use the watchlist functionality

  Scenario: Login link leads to login page
    Given I am on the home page
      And I am not logged in
    When I select the watchlist icon
      And I click Login
    Then Login page opens

  Scenario: Sign up link leads to Sign up page
    Given I am on the home page
      And I am not logged in
    When I select the watchlist icon
      And I click Sign up
    Then Sign up page opens

  Scenario: Add an article to the watchlist
    Given I am logged into the mobile website
    When I go to random page
      And I select the watchlist icon
    Then I receive notification that the article has been added to the watchlist
      And the article watchlist icon is selected

  Scenario: Remove an article from the watchlist
    Given I am logged into the mobile website
    When I go to random page
      And I select the watchlist icon
    Then I receive notification that the article has been removed from the watchlist
      And the article no longer has the watchlist icon selected
