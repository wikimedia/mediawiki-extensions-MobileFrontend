@chrome @editing @en.m.wikipedia.beta.wmflabs.org @extension-visualeditor @firefox @skip @vagrant
Feature: VisualEditor Mobile

  # Tests are skipped due to https://phabricator.wikimedia.org/T88559
  Background:
    Given I am logged into the mobile website
      And I am in beta mode
      And I am editing a new article with VisualEditor

  Scenario: Switch from VisualEditor to source editor
    When I switch to editing the source
      And I see the wikitext editor overlay
      And I click the wikitext editor overlay close button
    Then I should not see the wikitext editor overlay

  Scenario: I can edit a page using VisualEditor
    When I edit the article using VisualEditor
    Then I should see the edit reflected in the article content

  Scenario: Going back from save screen in VisualEditor
    When I click the escape button
    Then I should see the article content
      And I should no longer see the VisualEditor
