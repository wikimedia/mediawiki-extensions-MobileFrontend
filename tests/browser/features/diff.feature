@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org
Feature: Page diff

  Scenario: Added and removed content
    Given I am logged into the mobile website
      And the page "Selenium diff test" exists
      And I am on the "Selenium diff test" page
    When I click the edit button
      And I clear the editor
      And I type "ABC DEF" into the editor
      And I click continue
      And I click submit
      And I should not see the wikitext editor overlay
      And I click the edit button
      And I clear the editor
      And I type "ABC GHI" into the editor
      And I click continue
      And I click submit
      And I should not see the wikitext editor overlay
      And I click on the view edit history link
      And I open the latest diff
    Then I see "GHI" as added content
      And I see "DEF" as removed content

