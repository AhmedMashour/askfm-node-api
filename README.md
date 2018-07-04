# askfm-node-api

> ASK.FM Unofficial Nodejs API
Website Name : ASK.FM
Description : Ask and answer. Find out what people want to know about you!
Type : API (UnOfficial)
[![NPM 6.1.0][npm-image]][npm-url]

## Install

```bash
npm i -S askfm-node-api
```
## Usage 

```javascript
const askFM=require('askfm-node-api')
let cookie="<cookie string>"
let ask=new askFM(cookie)
```

## Example

-------
# Register Account
```javascript
ask.registerAccount("45.875.874.11:8080", true); //proxy , forceCookies
```
# Login
```javascript
ask.login(cookie)
```
# Ask
```javascript
ask.ask("FamusaCowoy", "Oi!", 1) //username, question, anonymity 
```

# Like one
```javascript
ask.likeOne("FamusaCowoy", "139457224382") //username, answerId
```
# Like All

```javascript
ask.likeALl("FamusaCowoy") //username, answerId
```
# Fetch Questions

```javascript
ask.fetchQuestions() //will return array of questions ids to use ask.answer() to answer tthem
```

# Answer Question

```javascript
ask.answer(questionId,answer) //see example above for questionId
```

# Logout

```javascript
ask.logout() 
```

**All above examples return a promise to with .then()**

## Notice 
**This is an open source code and language conversion from the the php also open source unoffical api for askFm youll find it's github repo here [\[Kom3\] AskFM Unofficial API](https://github.com/kom3/askfm-api)**
## Legal
**This code is in no way affiliated with, authorized, maintained, sponsored or endorsed by ASK.FM or any of its affiliates or subsidiaries. Use at your own risk.**

[npm-image]: https://img.shields.io/npm/v/live-xxx.svg
[npm-url]: https://npmjs.org/package/live-xxx

