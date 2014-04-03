@chrome @en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @firefox @login @test2.m.wikipedia.org
Feature: Manage Watchlist

  Scenario: Switching to Feed view
    Given I am logged into the mobile website
      And I am on the "Special:Watchlist" page
    When I switch to the modified view of the watchlist
    Then I see a list of diff summary links
      And The modified button is selected

  Scenario: Switching to List view
    Given I am logged into the mobile website
      And I am on the "Special:Watchlist" page
      And I switch to the modified view of the watchlist
    When I switch to the list view of the watchlist
    Then I see a list of pages I am watching
      And The a to z button is selected
