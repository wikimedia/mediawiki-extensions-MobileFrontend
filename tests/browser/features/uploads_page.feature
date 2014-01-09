@en.m.wikipedia.beta.wmflabs.org @test2.m.wikipedia.org @login
Feature: Special:Uploads uploads

  Scenario: Upload image file
    Given I am logged into the mobile website
      And I select Uploads
    When I upload Mobile file image.png on UploadsPage
      And I type a description
      And I click Submit
    Then my image is on the Uploads page
      And The Contribute an image button is visible
