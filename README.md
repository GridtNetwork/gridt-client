<p align="center">
  <a href="https://www.gridt.org">
    <img alt="Gridt" title="Gridt" src="https://app.gridt.org/assets/gridt_logo.png" width="300">
  </a>
</p>
<h4 align="center">The network for connecting social movements.</h4>
<p align="center">
  <a href="https://app.gridt.org">
    <img src="https://img.shields.io/website?url=https%3A%2F%2Fapp.gridt.org" alt="website">
  </a>
  <a href="https://github.com/GridtNetwork/gridt-client/actions?query=workflow%3ACI">
    <img src="https://github.com/GridtNetwork/gridt-client/workflows/CI/badge.svg" alt="Build Status">
  </a>
  <a href="https://github.com/GridtNetwork/gridt-client/actions?query=workflow%3ACI">
    <img src="https://img.shields.io/github/last-commit/GridtNetwork/gridt-client" alt="Build Status">
  </a>
</p>

---

We’re developing a non-profit, open source social application that inspires discipline, leadership and ‘grit’ in its users. The Gridt is designed as a new type of network that connects social movements.

Gridt-client is the frontend for the [Gridt](https://gridt.org) application. The backend can be found on our [server repository](https://github.com/GridtNetwork/gridt-server).

<p align="center">
  <img alt="GitPoint" title="GitPoint" src="https://gridtorg.files.wordpress.com/2018/12/HIW_4-1.jpg" width="300">
  <img alt="GitPoint" title="GitPoint" src="https://gridtorg.files.wordpress.com/2018/12/HIW_2-1.jpg" width="300">
</p>

## Prerequisites
Note: if you are using ubuntu, some of the installation commands may need to be run with **sudo**.

### Ionic
This application is built with [Ionic](https://ionicframework.com/) which is a framework to build cross platform applications. It comes with regular Angular installations.


### NodeJS
You will need to use [Node.js](https://nodejs.org/en/) and npm to install the application dependencies. If you do not already have Node.js and npm installed, follow these steps:

```
install curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
nvm ls-remote
```
The last command shows a list of Node.js versions. Choose the newest one. Install this latest version of Node.js, with NVM (Node Version Manager). As an example, this is how you install version v19.3.0:

```
nvm install 19.3.0
```

You now have both Node.js and npm. To verify the installation and version numbers, run the following commands:

```
nvm version
npm --version
```
## Installation
You will need to install all the dependencies. to do that: use the following commands:

```
cd gridt
npm install --legacy-peer-deps
```

In the case that you run into issues with Phantom.js while installing the dependencies, consult these [steps](https://gist.github.com/julionc/7476620).

## Running

In the **gridt** folder, run:

```
ionic serve
```

A browser window should automatically pop-up and redirect you to the website.

## Contributing
[![Contributers](https://img.shields.io/github/contributors/GridtNetwork/gridt-client)](https://github.com/GridtNetwork/gridt-client/graphs/contributors)
[![Pull requests](https://img.shields.io/github/issues-pr/GridtNetwork/gridt-client)](https://github.com/GridtNetwork/gridt-client/pulls)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?)](http://makeapullrequest.com)

See [CONTRIBUTING](./CONTRIBUTING.md) for information on how to contribute with coding. Also make sure to look at our [CODE OF CONDUCT](./CODE_OF_CONDUCT.md).


## Donate
[![OpenCollective](https://img.shields.io/opencollective/all/gridt)](https://opencollective.com/gridt)

Support this project on [OpenCollective](https://opencollective.com/gridt).

## Support
For code related issues please contact our main developer @Drvanon. For non-code related issues please contact @Yori-O92 or send an email to info@gridt.org.

## License
[![GPLv3 license](https://img.shields.io/badge/License-GPLv3-blue.svg)](http://perso.crans.org/besson/LICENSE.html)

The Gridt Network - the network for connecting social movements. Copyright (C) 2020, Stichting Gridt

## Special Thanks
- Sharon Smit
- Gerard van Enk
