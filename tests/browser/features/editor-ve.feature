@en.m.wikipedia.beta.wmflabs.org @test2.m.wikipedia.org
Feature: VisualEditor

Scenario: I can edit a page using VisualEditor
  Given I am in alpha mode
    And I am logged into the mobile website
  When I am on the Selenium Edit Test article
    And I click edit
    And VisualEditor has loaded
    And I type ABCDEFG into VisualEditor
    And I click continue
    And I click submit
  Then I see a toast confirmation
