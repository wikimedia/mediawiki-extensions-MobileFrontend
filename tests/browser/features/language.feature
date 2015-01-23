# FIXME: this assumes that the main page has more than one language
@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org
Feature: Language selection

  Background:
    Given I am using the mobile site
      And I go to a page that has languages
    When I click the language button
      And I see the language overlay

  @smoke
  Scenario: Closing language overlay (overlay button)
    When I click the language overlay close button
    Then I should not see the languages overlay

  Scenario: Closing language overlay (browser button)
    When I click the browser back button
    Then I should not see the languages overlay
