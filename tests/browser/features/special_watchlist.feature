@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @integration @skip @test2.m.wikipedia.org @vagrant
Feature: Manage Watchlist

  Background:
    Given I am logged into the mobile website
      And I have recently edited pages on my watchlist
      And I am on the "Special:EditWatchlist" page

  Scenario: Switching to Feed view
    When I switch to the modified view of the watchlist
      And I click the Pages tab
      And the Pages tab is selected
    Then I should see a list of diff summary links
      And the modified button should be selected

  Scenario: Switching to List view
    When I switch to the modified view of the watchlist
      And I switch to the list view of the watchlist
    Then I should see a list of pages I am watching
      And the a to z button should be selected
