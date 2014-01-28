@en.m.wikipedia.beta.wmflabs.org @test2.m.wikipedia.org
Feature: VisualEditor

Scenario: Toolbar VisualEditor
  Given I am in alpha mode
    And I am logged into the mobile website
  When I am on the Selenium Edit Test article
    And I click edit
  Then I see the VisualEditor overlay
    And I see a toolbar in the overlay header
    And The VisualEditor toolbar has a bold button
    And The VisualEditor toolbar has an italic button

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

Scenario: Going back from save screen in VisualEditor
  Given I am in alpha mode
    And I am logged into the mobile website
  When I am on the Selenium Edit Test article
    And I click edit
    And I type ABCDEFG into VisualEditor
    And I click continue
    And I click the escape button
  Then I see the VisualEditor
