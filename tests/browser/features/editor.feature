@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @test2.m.wikipedia.org
Feature: Editor

  Background:
    Given I am logged into the mobile website
    When I go to an uncreated page using URL Nonexistent_page_ijewrcmhvg34773
      And I click the edit button

  Scenario: Opening editor
    Then I see the editor

  Scenario: Closing editor (overlay button)
    When I click the editor overlay close button
    Then I should not see the editor
      And the URL of of my page should contain Nonexistent_page_ijewrcmhvg34773

  Scenario: Closing editor (browser button)
    When I click the browser back button
    Then I should not see the editor
      And the URL of of my page should contain Nonexistent_page_ijewrcmhvg34773
