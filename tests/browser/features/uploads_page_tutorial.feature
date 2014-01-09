@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @test2.m.wikipedia.org @login
Feature: Special:Uploads tutorial

  Scenario: Link to tutorial for new user
    Given I am logged in as a new user
    When I go to uploads page
    Then The upload button links to the tutorial
