@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org
Feature: Page actions menu when anonymous

  Background:
    Given I visit a protected page

  Scenario: I cannot edit a protected page when anonymous
    When I click the edit icon holder
    Then I see a toast notification
