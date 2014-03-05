@en.m.wikipedia.beta.wmflabs.org @test2.m.wikipedia.org
Feature: Page diff

  Scenario: Added and removed content
    Given I am logged into the mobile website
    When I go to the "Diff test" page
      And I click the edit button
      And I clear the editor
      And I type "ABC DEF" into the editor
      And I click continue
      And I click submit
      And I click the edit button
      And I clear the editor
      And I type "ABC GHI" into the editor
      And I click continue
      And I click submit
      And I click on the view edit history link
      And I open the latest diff
    Then I see "GHI" as added content
      And I see "DEF" as removed content

