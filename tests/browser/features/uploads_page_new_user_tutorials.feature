@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @login @test2.m.wikipedia.org
Feature: Special:Uploads

  Scenario: See tutorial as new user
    Given I am logged in as a new user
    When I go to uploads page
    Then I see a blue tutorial screen
      And I see a next button

  Scenario: Link to tutorial for new user in beta
    Given I am logged in as a new user
      And I am in beta mode
    When I go to uploads page
    Then The upload button links to the tutorial
