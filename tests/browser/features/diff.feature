@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org @vagrant
Feature: Page diff

  @smoke @editing @integration
  Scenario: Added and removed content
    Given I am logged into the mobile website
      And the page "Selenium diff test 3" has the following edits:
        | text     |
        | ABC DEF  |
        | ABC GHI  |
    When I am on the "Selenium diff test 3" page
      And I click on the history link in the last modified bar
      And I open the latest diff
    Then I should see "GHI" as added content
      And I should see "DEF" as removed content
