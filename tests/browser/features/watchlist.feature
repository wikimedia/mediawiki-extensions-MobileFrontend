@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @test2.m.wikipedia.org
Feature: Manage Watchlist

  Scenario: I receive notification that I need to log in to use the watchlist functionality
    Given I am on the home page
      And I am not logged in
    When I select Watchlist
    Then I receive watchlist message A watchlist helps you bookmark pages and keep track of changes to them.
      And I receive watchlist message Log in to see it.

  Scenario: Add an article to the watchlist
    Given I am logged into the mobile website
    When I go to random page
      And I select Watchlist
    Then I receive notification that the article has been added to the watchlist
      And the article watchlist icon is selected

  Scenario: Remove an article from the watchlist
    Given I am logged into the mobile website
    When I go to random page
      And I select Watchlist
    Then I receive notification that the article has been removed from the watchlist
      And the article no longer has the watchlist icon selected
