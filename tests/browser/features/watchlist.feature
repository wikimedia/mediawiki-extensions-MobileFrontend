@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @test2.m.wikipedia.org
Feature: Manage Watchlist

  Scenario: Clicking the watchlist item in main menu when anonymous
    Given I am on the home page
      And I am not logged in
    When I click on "Watchlist" in the main navigation menu
    Then I receive watchlist message A watchlist helps you bookmark pages and keep track of changes to them.
      And I receive watchlist message Log in to see it.

  @login
  Scenario: Add an article to the watchlist
    Given I am logged into the mobile website
      And I am on the "Barack Obama" page
      And I click the watch star
    Then I see a toast notification
      And I see a toast with message "Added Barack Obama to your watchlist"
      And The watch star is selected

  @login
  Scenario: Remove an article from the watchlist
    Given I am logged into the mobile website
    # FIXME: This assumes the scenario above has run and that the article is in fact watched
    # Add statement to ensure the Barack Obama article is already watched.
      And I am on the "Barack Obama" page
    When I click the watch star
    Then I see a toast notification
      And I see a toast with message "Removed Barack Obama from your watchlist"
      And The watch star is not selected
