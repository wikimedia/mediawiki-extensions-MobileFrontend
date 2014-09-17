# FIXME: this assumes that the main page has more than one language
@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org
Feature: Language selection

  Background:
    Given I am using the mobile site
      And I go to a page that has languages
      And I see the read in another language button
    When I click the language button

  Scenario: Opening language overlay
    Then I see the language overlay

  Scenario: Closing language overlay (overlay button)
    When I click the language overlay close button
    Then I don't see the languages overlay

  Scenario: Closing language overlay (browser button)
    Given I see the language overlay
    When I click the browser back button
    Then I don't see the languages overlay
