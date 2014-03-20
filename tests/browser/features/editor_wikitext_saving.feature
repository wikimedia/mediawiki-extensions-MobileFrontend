@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org
Feature: Wikitext Editor (Makes actual saves)

  Background:
    Given I am logged into the mobile website
      And I am on the "San Francisco" page

  Scenario: Successful edit reloads language button
    And I see the read in another language button
    When I click the edit button
      And I see the wikitext editor
      And I type "ABC GHI" into the editor
      And I click continue
      And I click submit
    Then I see a toast notification
      And I see the read in another language button
