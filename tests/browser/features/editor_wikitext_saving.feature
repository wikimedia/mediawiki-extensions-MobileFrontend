@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org
Feature: Wikitext Editor (Makes actual saves)

  Background:
    Given I am logged into the mobile website

  @smoke
  Scenario: Successful edit on page without languages shows no language button [bug 63675]
    Given the page "Selenium no languages test page" exists
    When I click the edit button
      And I see the wikitext editor overlay
      And I type "ABC GHI" into the editor
      And I click continue
      And I click submit
    Then I should see a toast notification
      And the text of the first heading should be "Selenium no languages test page"
      And I should not see the read in another language button

  Scenario: Successful edit reloads language button
    Given I go to a page that has languages
    When I click the edit button
      And I see the wikitext editor overlay
      And I type "ABC GHI" into the editor
      And I click continue
      And I click submit
    Then I should see a toast notification
      And I should see the read in another language button

  Scenario: Redirects
    Given the page "Selenium wikitext editor test" exists
      And I am on a page that does not exist
    When I click the edit button
      And I clear the editor
      And I type "#REDIRECT [[Selenium wikitext editor test]]" into the editor
      And I click continue
      And I click submit
      And I say OK in the confirm dialog
      And I do not see the wikitext editor overlay
    Then the text of the first heading should be "Selenium wikitext editor test"

  Scenario: Broken redirects
    Given I am on a page that does not exist
    When I click the edit button
      And I clear the editor
      And I type "#REDIRECT [[AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA]]" into the editor
      And I click continue
      And I click submit
      And I say OK in the confirm dialog
      And I do not see the wikitext editor overlay
    Then there should be a red link with text "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
