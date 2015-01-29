@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org @vagrant @extension-cite
Feature: Reference popup drawer

  Background:
    Given I am using the mobile site

  Scenario: Opening the reference drawer
    Given I go to a page that has references
    When I click on a reference
    Then I should see the reference drawer

  Scenario: Closing the reference drawer
    Given I go to a page that has references
    When I click on a reference
      And I click on the page
    Then I should not see the reference drawer
