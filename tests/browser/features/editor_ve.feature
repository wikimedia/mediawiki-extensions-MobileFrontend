@chrome @en.m.wikipedia.beta.wmflabs.org @extension-visualeditor @firefox @login @vagrant
Feature: VisualEditor Mobile

  Background:
    Given I am logged into the mobile website
      And I am in beta mode
      And I am editing a new article with VisualEditor

  Scenario: Switch from VisualEditor to source editor
    When I switch to editing the source
    Then I see the wikitext editor

  Scenario: VisualEditor provides bold
    When I look at the VisualEditor toolbar
    Then I see a bold button

  Scenario: VisualEditor provides italicize
    When I look at the VisualEditor toolbar
    Then I see an italicize button

  Scenario: I can edit a page using VisualEditor
    When I edit the article using VisualEditor
    Then I see the edit reflected in the article content

  Scenario: Going back from save screen in VisualEditor
    When I click the escape button
    Then I see the article content
      But I no longer see the VisualEditor
