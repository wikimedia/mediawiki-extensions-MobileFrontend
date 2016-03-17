@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org
Feature: Language selection via language switcher button in beta

  Background:
    Given I am using the mobile site
      And I am in beta mode
      And I go to a page that has languages

  @smoke @integration
  Scenario: Language button in beta
     Then I should see the alternative language switcher button

  Scenario: Tapping icon opens language overlay
    When I click the alternative language button
    Then I should see the language overlay

  Scenario: Closing language overlay (overlay button)
    When I click the alternative language button
     And I see the language overlay
     And I click the language overlay close button
    Then I should not see the languages overlay

  Scenario: Closing language overlay (browser button)
    When I click the alternative language button
     And I see the language overlay
     And I click the browser back button
    Then I should not see the languages overlay
