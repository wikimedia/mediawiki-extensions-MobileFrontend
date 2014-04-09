@chrome @en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @firefox @login @test2.m.wikipedia.org
Feature: Language Validation - Logged In

  Background:
    Given I am logged into the mobile website
    And I go to a page that has languages

  Scenario: Validate Language selection availability
    When I click the language button
    Then I see the language overlay
