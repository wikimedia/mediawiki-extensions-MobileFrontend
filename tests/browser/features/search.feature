@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @test2.m.wikipedia.org
Feature: Search

  Scenario: Search for partial text
    Given I am on the home page
     When I click the placeholder search box
       And I type into search box bara
    Then Search results should contain Barack Obama
