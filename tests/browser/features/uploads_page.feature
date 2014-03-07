@en.m.wikipedia.beta.wmflabs.org @login @test2.m.wikipedia.org
Feature: Special:Uploads uploads

  Scenario: Upload image file of invalid format
    Given I am logged into the mobile website
      And I click on "Uploads" in the main navigation menu
    When I try to upload foo.tgz on UploadsPage
    Then I see a toast error

  Scenario: Upload image file
    Given I am logged into the mobile website
      And I click on "Uploads" in the main navigation menu
    When I click the upload button to stage the image file "image.png"
      And I type a description
      And I click Submit
    Then my image is on the Uploads page
      And The Contribute an image button is visible
