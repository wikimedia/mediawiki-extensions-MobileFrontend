# MobileFrontend Contributing Guide

## Welcome

Welcome to the MobileFrontend Contributing Guide, and thank you for your
interest.

This guide covers the different ways you can contribute. We are always open to
contributions in the following forms:

- Bug Reports and bug fixes
- Documentation improvements

At this time, we do not accept the following contributions:

- **Feature requests**: MobileFrontend is undergoing strategic sunsetting. We
are gradually reducing the scope of this extension and moving functionality to
MediaWiki core and other extensions. As such, we are not accepting new features
at this time.

### Overview

MobileFrontend is a MediaWiki extension that provides an optimized mobile
experience for MediaWiki sites. It automatically detects mobile devices and
serves mobile-optimized versions of wiki pages with features like collapsible
sections, lazy-loaded images, and touch-friendly navigation.

For more information, refer to the [README][readme] and
[MobileFrontend extension][mw-extension].

### Community engagement

Refer to the following channels to connect with fellow contributors or to stay
up-to-date with news about the MobileFrontend:

- Refer to the [OWNERS][owners] for team ownership and contributor contacts
organized by feature area.
- Participate in discussions in [Village Pump][village-pump].
- Stay updated on the latest news and changes to the project by following
  [MediaWiki's version lifecycle page][version-lifecycle].

## Contributing

Guidelines for specific ways of contributing to this project can be found
below.

### Ground rules

Before contributing, read our [Code of Conduct][coc] to learn more about our
community guidelines and expectations.

### Bug Reports

We use Phabricator to track tasks and bug reports. To report a bug:

1. **Search for existing issues**: Check if the issue has already been reported
   in [Phabricator][phabricator-board].
2. **Create a new issue**: If the issue doesn't exist, create a new issue on
   Phabricator through the Create Task dropdown.
3. **Provide details**: Include:
   - A clear description of the issue
   - Steps to reproduce
   - Expected vs. actual behavior
   - Your environment (MediaWiki version, browser, etc.)
   - Screenshots or error messages if applicable

### Proposals and feature requests

To share your new ideas for the project, perform the following actions:

1. Create an issue on [Phabricator][phabricator-board].
2. Describe your idea clearly, including the problem you're trying to solve.
3. Wait for feedback from maintainers before starting implementation.

### Code contribution

#### Before you start

Before you start contributing, ensure you have the following:

- A [Wikimedia developer account][wmf-dev-account] with Gerrit access
- A local MediaWiki development environment (refer to
[Local development quickstart][local-dev])
- Node.js and npm
- PHP 8.1+ and Composer
- Basic familiarity with MediaWiki extension development, Javascript, and PHP

For more information, refer to [How to become a MediaWiki hacker][mw-hacker].

#### Environment setup

For installation and setup instructions, including cloning the repository,
installing dependencies, and configuring LocalSettings.php, refer to the
[README][readme].

#### Troubleshooting

For general MediaWiki development issues, consult the
[Installing MediaWiki documentation][installing-mw].

#### Best practices

Our project uses the following resources as our parent guides for best
practices:

- **PHP**: [MediaWiki's PHP coding conventions][php-conventions]
- **JavaScript**: [MediaWiki's JavaScript coding conventions][js-conventions]
- **CSS/LESS**: [MediaWiki's CSS coding conventions][css-conventions]

Reference these guides to familiarize yourself with the best practices we want
contributors to follow.

#### Contribution workflow

##### Fork and clone repositories

MobileFrontend uses [Gerrit Code Review][gerrit] for code review. To
contribute:

1. **Set up Gerrit**: Follow the [Gerrit/Tutorial][gerrit-tutorial] to set up
   your Gerrit account and SSH keys.

2. **Clone the repository**:
```sh
   git clone "ssh://USERNAME@gerrit.wikimedia.org:29418/mediawiki/extensions/MobileFrontend"
```

3. **Install the commit-msg hook**:
```sh
   cd MobileFrontend
   git review -s
```

#### Issue management

Issues are managed through Gerrit Code Review. When creating or tagging issues:

- Use descriptive titles
- Tag issues with appropriate labels (bug, enhancement, documentation, etc.)
- Reference related issues or patches when applicable
- Keep issues up to date with status changes

#### Commit messages

Follow [MediaWiki's commit message guidelines][commit-guidelines]:

- Use a short summary line (50 characters or less)
- Follow with a blank line and a detailed description
- Reference related issues or patches
- Use the present tense ("Add feature" not "Added feature")

Example:
```
Define ownership in the MobileFrontend extension

Adds an OWNERS.md file which lists major areas of functionality
within the codebase and assigns a responsible team to each one.

Bug: T403659
```

#### Submitting patches

In MediaWiki, we use "change requests" (patches) in Gerrit instead of pull
requests. To submit a change:

1. **Make your changes** following the best practices and coding conventions.

2. **Run tests and linting**:
```sh
   # Back end
   composer test

   # Front end
   npm run test
```

3. **Fix any issues** found by the linters or tests.

4. **Commit your changes** following the commit message guidelines.

5. **Push to Gerrit**:
```sh
   git review
```

6. **Wait for code review**: A maintainer will review your change. Address any
   feedback by amending your commit and pushing again.

For more information, refer to the [Gerrit/Tutorial][gerrit-tutorial].

#### Releases

MobileFrontend follows MediaWiki's "continuous integration" development
model, where software changes are pushed live to wikis regularly. Refer to the
[deployment schedule][deployment].

#### Text formats

When editing and creating documents:

- **Markdown**: Use Markdown (`.md` files) for documentation
- **PHP**: Use PHP for back-end code, following MediaWiki's PHP coding
  conventions
- **JavaScript**: Use JavaScript/ES6+ for front-end code, following MediaWiki's
  JavaScript coding conventions
- **LESS**: Use LESS for stylesheets, following MediaWiki's CSS coding
  conventions
- **JSON**: Use JSON for configuration files (e.g., `extension.json`,
  `package.json`)

[readme]: README.md
[owners]: OWNERS.md
[village-pump]: https://en.wikipedia.org/wiki/Wikipedia:Village_pump
[version-lifecycle]: https://www.mediawiki.org/wiki/Version_lifecycle
[coc]: CODE_OF_CONDUCT.md
[phabricator-board]: https://phabricator.wikimedia.org/project/board/1157/
[wmf-dev-account]: https://www.mediawiki.org/wiki/How_to_become_a_MediaWiki_hacker#Get_a_developer_account
[local-dev]: https://www.mediawiki.org/wiki/Local_development_quickstart
[mw-hacker]: https://www.mediawiki.org/wiki/How_to_become_a_MediaWiki_hacker
[installing-mw]: https://www.mediawiki.org/wiki/Manual:Installing_MediaWiki
[php-conventions]: https://www.mediawiki.org/wiki/Manual:Coding_conventions/PHP
[js-conventions]: https://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript
[css-conventions]: https://www.mediawiki.org/wiki/Manual:Coding_conventions/CSS
[gerrit]: https://www.mediawiki.org/wiki/Gerrit
[gerrit-tutorial]: https://www.mediawiki.org/wiki/Gerrit/Tutorial
[commit-guidelines]: https://www.mediawiki.org/wiki/Gerrit/Commit_message_guidelines
[deployment]: https://wikitech.wikimedia.org/wiki/Deployments
[mw-extension]: https://www.mediawiki.org/wiki/Extension:MobileFrontend
