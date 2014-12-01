@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login
Feature: Page actions menu when anonymous

  Background:
    Given I am using the mobile site
      And I visit a protected page

  Scenario: I cannot edit a protected page when anonymous
    When I click the edit icon holder
    Then I should see a toast notification
