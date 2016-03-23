@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org
Feature: Language selection

  Background:
    Given I am using the mobile site
      And I go to a page that has languages
    When I click the language button
      And I see the language overlay

  @smoke @integration
  Scenario: Closing language overlay (overlay button)
    When I click the language overlay close button
    Then I should not see the languages overlay

  Scenario: Closing language overlay (browser button)
    When I click the browser back button
    Then I should not see the languages overlay

  Scenario: Checking that there are no preferred language links
    Then I should not see a preferred language link
    Then I should see a non-preferred language link

  @smoke
  Scenario: Checking that the preferred language link has been created
    When I click on a language from the list of all languages
      And I click the browser back button
      And I see the language overlay
    Then I should see a preferred language link
