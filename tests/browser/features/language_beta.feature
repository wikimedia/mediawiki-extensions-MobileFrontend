@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org
Feature: Language selection via language switcher button in beta

  Background:
    Given I am using the mobile site
      And I am in beta mode

  @smoke @integration
  Scenario: Language button in beta
    Given I go to a page that has languages
    Then I should see the alternative language switcher button

  @smoke @integration
  Scenario: Language button in beta (on a page that doesn't have languages)
    Given I go to a page that does not have languages
    Then I should see the disabled alternative language switcher button

  Scenario: Tapping icon opens language overlay
    Given I go to a page that has languages
    When I click the alternative language button
    Then I should see the language overlay

  Scenario: Tapping icon does not open language overlay (on a page that doesn't have languages)
    Given I go to a page that does not have languages
    When I click the alternative language button
    Then I should not see the languages overlay

  Scenario: Closing language overlay (overlay button)
    Given I go to a page that has languages
    When I click the alternative language button
     And I see the language overlay
     And I click the language overlay close button
    Then I should not see the languages overlay

  Scenario: Closing language overlay (browser button)
    Given I go to a page that has languages
    When I click the alternative language button
     And I see the language overlay
     And I click the browser back button
    Then I should not see the languages overlay
