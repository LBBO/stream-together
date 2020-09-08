# Welcome to Stream together 👋
![Version](https://img.shields.io/badge/dynamic/json?color=blue&url=https://raw.githubusercontent.com/LBBO/stream-together/main/package.json&query=$.version&label=version)

> Stream any video together with friends without worrying about synchronization

## Install plugin
Head to this project's [releases page](https://github.com/LBBO/stream-together/releases) and download the
latest release's `stream-together-vX.X.X.zip` file.
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

With everything set up, just visit a website with a video on it. For most pages, the URL
will be set automatically. If you see a long random string after a `#` in the URL,
that is the case and you can skip the next step. Your URL should look somewhat like this:

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ#19b9cdee-961e-4d1d-b0e9-07fe6f35ca32
```

If it doesn't, you'll have to open the console and you'll find a `sessionID` there. Copy it
and manually add it to your URL after a `#`. Your URL should now somewhat resemble the URL
above.

This link can now be shared with your friends to watch the video together!

The session ID isn't always added automatically, as it can cause some websites
to break (such as Disney Plus, currently). I am looking for a better solution but suggestions are
always welcome!

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
