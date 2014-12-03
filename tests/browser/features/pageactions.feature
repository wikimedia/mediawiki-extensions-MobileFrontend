@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org @vagrant
Feature: Page actions menu when anonymous

  Background:
    Given I am using the mobile site
      And I am at a random page

  Scenario: Receive notification message - Edit Icon
    When I click the edit icon holder
    Then I should see a drawer with message "Help improve this page!"

  Scenario: Do not see - Upload Icon
    Then I should not see an upload an image to this page button

  Scenario: Receive notification message - Watchlist Icon
    When I click the watch star
    Then I should see a drawer with message "Keep track of this page and all changes to it."
