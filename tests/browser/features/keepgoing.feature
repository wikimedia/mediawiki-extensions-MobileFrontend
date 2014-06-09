@chrome @en.m.wikipedia.beta.wmflabs.org @firefox
Feature: Encourage new users to Keep Going

  Scenario: I see a KeepGoing message after completing my edit
    Given I have just registered a new account
      And I am viewing the site in mobile mode
      And I am in beta mode
      And I am on the "Selenium Edit Test" page
    When I click the edit button
      And I type "ABCDEFG" into the editor
      And I click continue
      And I click submit
    Then I see the KeepGoing drawer prompting me to continue editing

  Scenario: I see a KeepGoing message after completing my VisualEditor edit
    Given I have just registered a new account
      And I am viewing the site in tablet mode
      And I am in beta mode
      And I am on the "Selenium Edit Test" page
    When I click the edit button
      And I see the wikitext editor overlay
      And the wikitext editor overlay has an editor mode switcher button
      And I click the editor mode switcher button
      And I click the VisualEditor button
      And VisualEditor has loaded
      And I type "ABCDEFG" into VisualEditor
      And I click continue
      And I click submit
    Then I see the KeepGoing drawer prompting me to continue editing
