@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login
Feature: VisualEditor

Background:
  Given I am logged into the mobile website
    And I am viewing the site in tablet mode
    And I am in beta mode

Scenario: Switch from VisualEditor to source editor
  Given I am on the "Selenium Edit Test" page
    And I click the edit button
    And I switch to VisualEditor
    And I see the VisualEditor overlay
    And I am on the "Selenium Edit Test" page
    And I click the edit button
    And I see the VisualEditor overlay
    And the VisualEditor overlay has an editor mode switcher button
    And I click the editor mode switcher button
  When I click the source editor button
  Then I see the wikitext editor overlay

Scenario: Toolbar VisualEditor
  Given I am on the "Selenium Edit Test" page
    And I click the edit button
    And I switch to VisualEditor
  Then I see the VisualEditor overlay
    And I see a toolbar in the overlay header
    And the VisualEditor toolbar has a bold button
    And the VisualEditor toolbar has an italic button

Scenario: I can edit a page using VisualEditor
  Given I am on the "Selenium Edit Test" page
    And I click the edit button
    And I switch to VisualEditor
    And VisualEditor has loaded
    And I type "ABCDEFG" into VisualEditor
    And I click continue
  When I click submit
  Then I do not see the VisualEditor overlay
    And I see a toast notification

Scenario: Going back from save screen in VisualEditor
  Given I am on the "Selenium Edit Test" page
    And I click the edit button
    And I switch to VisualEditor
    And VisualEditor has loaded
    And I type "ABCDEFG" into VisualEditor
    And I click continue
  When I click the escape button
  Then I see the VisualEditor
