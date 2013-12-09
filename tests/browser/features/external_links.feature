@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @test2.m.wikipedia.org
Feature: Validate External Links

  Scenario: External Links resolve
    Given I am on the Barack_Obama article
    When I expand External Links Section
      And I click on the White House official website link
    Then I receive White House official website page
