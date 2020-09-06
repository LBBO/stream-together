# Welcome to Stream together 👋
![Version](https://img.shields.io/badge/version-0.1.2-blue.svg?cacheSeconds=2592000)

> Stream any video together with friends without worrying about synchronization

## Install
To install the dependencies, run 

```sh
npm install
```

If you aren't running your server locally, you'll have to edit
`./src/plugin/backgroundScript.ts` and change the first line to reflect your
server URL and port. If you use HTTPS and WSS, you will have to change that
as well. I apologize for the inconvenience and hope to extract this stuff
into some actual settings in the future.

```ts
// ./src/plugin/backgroundScript.ts:3
const serverUrl = 'myDomain.com:1234'
```

Next, you'll need to compile the plugin and install it. To do that, just run:

```sh
npm run devContentScript
```

This will create a `./dist` folder with the actual plugin. Open up
[Chrome's extensions page](chrome:///extensions) and add an unpacked
extension.
Choose this project's root folder, and you should be good to go!

## 🚀 Usage
To run the server locally, run
```sh
npm run devServer
```

⚠ Attention: Webstorm (for some reason) will not execute this script correctly
in WSL. It needs to be executed via the shell (integrated shell is fine), but
the Run tab won't do it.

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
