@chrome @en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @firefox @login @test2.m.wikipedia.org
Feature: Manage Watchlist

  Scenario: Add an article to the watchlist
    Given I am logged into the mobile website
      And I am on the "Barack Obama" page
      And I click the watch star
    Then I see a toast notification
      And I see a toast with message "Added Barack Obama to your watchlist"
      And The watch star is selected

  Scenario: Remove an article from the watchlist
    Given I am logged into the mobile website
    # FIXME: This assumes the scenario above has run and that the article is in fact watched
    # Add statement to ensure the Barack Obama article is already watched.
      And I am on the "Barack Obama" page
    When I click the watch star
    Then I see a toast notification
      And I see a toast with message "Removed Barack Obama from your watchlist"
      And The watch star is not selected
