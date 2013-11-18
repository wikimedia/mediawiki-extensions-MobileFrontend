@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @test2.m.wikipedia.org
Feature: Language Validation

  Scenario: Validate Language selection availability
    Given I am on the home page
    When I click the language button
    Then I move to the language screen