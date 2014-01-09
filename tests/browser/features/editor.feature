@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @test2.m.wikipedia.org
Feature: Editor

  Background:
    Given I am logged into the mobile website
    When I go to a nonexistent page
      And I click the edit button

  Scenario: Opening editor
    Then I see the editor

  Scenario: Closing editor (overlay button)
    When I click the editor overlay close button
    Then I don't see the editor
      And I am on the nonexistent page

  Scenario: Closing editor (browser button)
    When I click the browser back button
    Then I don't see the editor
      And I am on the nonexistent page
