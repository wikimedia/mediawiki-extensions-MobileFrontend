@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org
Feature: Wikitext Editor (TEST RUN ON WIKIPEDIA SO SHOULD NOT CAUSE SAVES)

  Background:
    Given I am logged into the mobile website
      And I am on a page that does not exist
    When I click the edit button

  Scenario: Opening editor
    Then I see the wikitext editor overlay

  Scenario: Closing editor (overlay button)
    When I click the wikitext editor overlay close button
    Then I should not see the wikitext editor overlay

  Scenario: Closing editor (browser button)
    When I click the browser back button
    Then I should not see the wikitext editor overlay
