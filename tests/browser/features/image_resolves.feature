@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @test2.m.wikipedia.org
Feature: Image Resolves to the correct place

  Scenario: Image link resolves
    Given I am on the Barack_Obama article
    When I expand Presidential Campaign Section
      And I click on this image
    Then I go to the image's page
