Feature: Language Validation - Logged In

    Background:
      Given I am logged into the mobile website

    Scenario: Validate Language selection availability
      And I am on the home page
      When I click the language button
      Then I move to the language screen