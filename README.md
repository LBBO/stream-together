# Welcome to Stream together 👋
![Version](https://img.shields.io/badge/dynamic/json?color=blue&url=https://raw.githubusercontent.com/LBBO/stream-together/main/package.json&query=$.version&label=version)

> Stream any video together with friends without worrying about synchronization

## Install plugin
Head to this project's [releases page](https://github.com/LBBO/stream-together/releases) and download the
latest release's `stream-together-X.X.X.zip` file.
Extract it to some location (which you'll need to remember).

Next, visit [Chrome's extensions page](chrome:///extensions)
and enable developer mode, if you haven't already.
Click on "Load an unpacked extension" and choose the
extracted folder's location.

If you're using a pre-existing backend, you can skip the next step.

## Install Server
Clone this repository to your server.
To install the dependencies, run 

```sh
npm install
```

Now you can start the server with

```sh
npm run devServer
```

⚠ Attention: Webstorm (for some reason) will not execute this script correctly
in WSL. It needs to be executed via the shell (integrated shell is fine), but
the Run tab won't do it.

## 🚀 Usage
If your server is not running on localhost, you'll need
to open the plug-in options by either visiting
[Chrome's extensions page](chrome:///extensions)
and going to Details > Extension options, or by
clicking on the extensions icon next to the navigation
bar, choosing the three dots and then Options.

### Creating a session
With everything set up, just visit a website with a video on it. You can then press on the plugin's
logo and a popup will appear. You can now create a new session. This will often modify your URL
by adding a random string after a `#`. The new URL might look something like this:

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ#19b9cdee-961e-4d1d-b0e9-07fe6f35ca32
```

This link can now be shared with your friends to watch the video together! If your link hasn't been
modified, you will need to share the link and session ID separately. The session ID can be found in the
same popup you used to create the session.

It isn't always added automatically, as it can cause some websites
to break (such as Disney Plus, currently). I am looking for a better solution but suggestions are
always welcome!

### Joining a session
Open the link you were sent. If it already contains the session ID (see [_Creating a session_](#creating-a-session)) your
videos should sync up automatically. If you received a session ID separately, click on the plugin's
logo and paste the session ID into the input field. After it has been validated, you will be able to
click on `Join Session` and your videos will be synced up from there on.

### Leaving a session
You automatically leave your session when the tab closes. To leave it without closing the tab, just
click on the plugin's logo and use the `Leave session` button.

## Run tests

```sh
npm test
```

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check
[issues page](https://github.com/LBBO/stream-together/issues). 

## Show your support

Give a ⭐️ if this project helped you!


***
_This README was generated with ❤️ by
[readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
