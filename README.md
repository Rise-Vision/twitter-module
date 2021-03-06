# Rise Twitter Module [![CircleCI](https://circleci.com/gh/Rise-Vision/twitter-module/tree/master.svg?style=svg)](https://circleci.com/gh/Rise-Vision/twitter-module/tree/master)

## Introduction

The Twitter Module is a Rise Player Module responsible for getting the Tweets from Twitter API for Twitter Components present on Digital Signage Presentations.

Twitter Module works in conjunction with [Rise Vision](http://www.risevision.com), the [digital signage management application](http://apps.risevision.com/) that runs on [Google Cloud](https://cloud.google.com).

At this time Chrome is the only browser that this project and Rise Vision supports.

## Built With
- NPM (node package manager)
- NodeJs
- Mocha
- Twitter
- Webpack
- Common-Display-Module from Rise Vision

### Dependencies
[Twitter Component](https://github.com/Rise-Vision/rise-twitter) and [Rise Player](https://github.com/Rise-Vision/rise-player) Modules

### Build
You can build the project with:
```
npm run build
```

### Testing
Unit tests can be run with:
```
npm run test-unit
```

Integration tests can be run with:
```
npm run test-integration
```

## Development

### Local Development Environment Setup and Installation

First you need to have NPM and NodeJS installed.

Then you can clone the project with the following command
```
git clone https://github.com/Rise-Vision/twitter-module.git
```

### Run Locally
First you need to install the dependencies with:
```
npm install
```

Then you can start the module with:
```
npm run start
```

### Manual Testing / Local Development
It is best that you run Twitter Component to test the expected behaviors. It is not recommended that you clone, install and run every individual module (i.e. Twitter Module, Licensing Module, Local Storage Module) and run Twitter Component Locally because Twitter Module needs a number of overwrite modifications to make it function properly such as hard-coding in valid Credentials.

Instead, manually test using an actual display or use a simulated display via software similar to VirtualBox.

## Deploying to Staging

Merging to master automatically deploys to beta Player

## Deploying to Stable

Pull Master branch into Stable branch and follow Player staggered release process
```
git pull origin master
```

## Submitting Issues
If you encounter problems or find defects we really want to hear about them. If you could take the time to add them as issues to this Repository it would be most appreciated. When reporting issues please use the following format where applicable:

**Reproduction Steps**

1. did this
2. then that
3. followed by this (screenshots / video captures always help)

**Expected Results**

What you expected to happen.

**Actual Results**

What actually happened. (screenshots / video captures always help)

## Contributing
All contributions are greatly appreciated and welcome! If you would first like to sound out your contribution ideas please post your thoughts to our [community](http://community.risevision.com), otherwise submit a pull request and we will do our best to incorporate it

### Suggested Contributions
- *we need this*
- *and we need that*
- *we could really use this*
- *and if we don't already have it (see above), we could use i18n Language Support*

## Resources
If you have any questions or problems please don't hesitate to join our lively and responsive community at http://community.risevision.com.

If you are looking for user documentation on Rise Vision please see http://www.risevision.com/help/users/

If you would like more information on developing applications for Rise Vision please visit http://www.risevision.com/help/developers/.

**Facilitator**

[Rodrigo Serviuc Pavezi](https://github.com/rodrigopavezi "Rodrigo Pavezi")
