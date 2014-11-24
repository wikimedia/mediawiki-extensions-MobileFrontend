@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org @vagrant
Feature: Page actions menu when logged in

  Background:
    Given I am logged into the mobile website
      And I am at a random page

  Scenario: I can see the edit button
    Then I should see the edit icon

  Scenario: I can add the page to my watchlist
    When I click on watchlist icon
    # Note could be watched or unwatched so do not check message
    Then I see a toast notification
