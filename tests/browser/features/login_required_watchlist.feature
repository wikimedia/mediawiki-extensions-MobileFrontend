@custom-browser @en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @test2.m.wikipedia.org
Feature: Login required for Watchlist

  # FIXME: Duplicate of watchlist.feature - review purpose of @custom-browser tag.
  Scenario: Login for Watchlist
    Given that I am using Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30
    When I click on "Watchlist" in the left navigation menu
    Then I receive watchlist message A watchlist helps you bookmark pages and keep track of changes to them
      And I receive watchlist message Log in to see it.
