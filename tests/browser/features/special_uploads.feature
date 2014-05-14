@chrome @en.m.wikipedia.beta.wmflabs.org @login @test2.m.wikipedia.org
Feature: Special:Uploads uploads


# The progress bar may or may not appear based on browser capability.
# The progress bar does not appear for Firefox as of May 2014
# Only run this test for Chrome

  Scenario: Upload image file of invalid format
    Given I am logged into the mobile website
      And I click on "Uploads" in the main navigation menu
      And I can see the uploads interface
    When upload bogus file BADFILE.tgz
    Then I see a toast error

  Scenario: Upload image file
    Given I am logged into the mobile website
      And I click on "Uploads" in the main navigation menu
      And I can see the uploads interface
    When I upload file "exif.jpg"
      And I type a description
      And I click Submit
    Then I see an upload progress bar
      And my image is on the Uploads page
      And The Contribute an image button is visible
