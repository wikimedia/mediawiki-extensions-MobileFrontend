@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @login @test2.m.wikipedia.org
Feature: Language Validation - Logged In

  Background:
    Given I am logged into the mobile website

  Scenario: Validate Language selection availability
    When I am on the home page
      And I click the language button
    Then I move to the language screen
