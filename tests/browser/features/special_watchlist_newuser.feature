@chrome @firefox @test2.m.wikipedia.org @vagrant
Feature: Manage Watchlist

  Background:
    Given I am using the mobile site
      And I am logged in as a new user
      And I am on the "Special:EditWatchlist" page

  Scenario: Empty Watchlist on list view
    Then I am informed on how to add pages to my watchlist

  Scenario: Empty Watchlist on feed view
    And I switch to the modified view of the watchlist
    When I click the Pages tab
    Then I am told there are no new changes
