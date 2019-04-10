@chrome @firefox @test2.m.wikipedia.org @vagrant @login
Feature: Editor watchlist

  Background:
    Given I am using the mobile site
      And I am logged in as a user with a > 10 edit count
      And I have recently edited pages on my watchlist
      And I am on the "Special:Watchlist" page

  Scenario: Default view for seasoned editors is the feed view
    Then I should see a list of diff summary links
      And the modified button should be selected

