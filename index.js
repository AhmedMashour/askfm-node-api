let request = require('request')
let jsonfile = require('jsonfile')
let co = require('co')
let cookie

class askFm {
    constructor() {
        this.cookie = cookie
        this._loggedIn = false
        this.lastError = null
        this.last_cookies = null
    }
    set cookieString(cookie) {
        this.cookie = cookie;
    }
    get cookieString() {
        return this.cookie;
    }
    login(cookies) {
        return this.http("https://ask.fm/account/wall", "https://ask.fm/", false, false, false, false, false, true).then(body => {
            this._loggedIn = true
            //console.log("done with the login",body)
            return body
        })
    }
    http(url, urlRef = "https://ask.fm/", post = false, postData = {}, csrf = false, proxy = false, requireXML = false, login = false) {
        return new Promise((resolve, reject) => {
            let userAgent = 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36';
            let headers = {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Accept-Encoding': 'ggzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
                'Referer': urlRef,
                'User-Agent': userAgent,
                'Host': 'ask.fm',
                'Upgrade-Insecure-Requests': 1
            }
            if (this.cookie !== null) {
                headers["Cookie"] = this.cookie
            }
            if (csrf) {
                headers['X-CSRF-Token'] = csrf;
            }
            let options = {
                uri: url,
                headers: headers
            }
            if (proxy !== false && proxy !== null && proxy !== undefined) {
                options["proxy"] = $proxy;
            }
            if (post) {
                options["method"] = "POST";
                options["json"] = postData;
            }

            request(options, (err, res, body) => {
                if (err) {
                    //console.log("error with the request", err)
                    reject(err)
                } else {
                    //console.log("done with the request")
                    if (res.statusCode == 200) {
                        if (login) {
                            let cookies_set_array = res.headers['set-cookie']
                            this.cookie = parseCookies(cookies_set_array)
                        }
                        resolve(res.body)
                    } else {
                        //console.log("status", res.statusCode, "message", res.statusMessage, "url", url, "ref", urlRef, "body", res.body)
                        if (res.body) resolve(res.body)
                        //resolve(res.body)
                    }
                }
            })
        })
    }
    get_token(c = false) {
        let url = (c) ? "http://ask.fm/signup" : "http://ask.fm/account/wall";
        return this.http(url).then(page => {
            let token
            if (c) {
                //console.log("c is true\n");
                let pattern = /name="authenticity_token" value="(.*)" \/>/;
                let result = pattern.exec(page)
                if (result && result.length > 1) {
                    token = result[1]
                }
            } else {
                let pattern = /name="csrf-token" content="(.*)" \/>/;
                let result = pattern.exec(page)
                if (result && result.length > 1) {
                    //console.log("between", result[1])
                    token = result[1]
                }
            }
            return token;
        })
    }
    ask(nickname, likeOnequestion, anon = false) {
        this.get_token().then(token => {

            if (token) {
                let data = {
                    authenticity_token: token,
                    question: {
                        question_text: question
                    }
                }
                if (anon && this._loggedIn)
                    data.question.question_type = "anonymous";

                data.show_online_status = 1;
                //console.log("going to ask the question", data)
                this.http("https://ask.fm/" + nickname + "/ask", "https://ask.fm/" + nickname + "/", true, data);
            } else {
                //console.log("can't get token")
            }
        })
    }
    likeOne(target, id) {
        if (this._loggedIn) {
            let token = this.get_token().then(token => {
                if (token) {
                    return this.http("https://ask.fm/" + target + "/answers/" + id + "/likes", "http://ask.fm/" + target, true, {}, token)
                }
            })
        } else {
            this.lastError = "Not logged in";
            return false;
        }
    }
    likeall(target, timestamp = new Date().getTime() / 1000) {
        if (this._loggedIn) {
            this.get_token().then(token => {
                if (token) {
                    this.http("https://ask.fm/" + target + "?older=" + timestamp, "https://ask.fm/account/wall").then(page => {
                        let regex = new RegExp('AnswerLikeToggle" data-url="\/' + target + '\/answers\/([0-9]+)\/likes"', "g")
                        let result, ids = [],
                            promises = [];
                        while ((result = regex.exec(page))) {
                            var LikeLink = result[1];
                            var Match = result[0];
                            ids.push(LikeLink)
                        }
                        ids.forEach(id => {
                            promises.push(this.http("https://ask.fm/" + target + "/answers/" + id + "/likes", "https://ask.fm/" + target, true, {}, token))
                        })
                        let race = Promise.race(promises)
                    })
                } else {
                    this.lastError = "Can't fetch tokens"
                }
            })
        } else {
            this.lastError = "Not logged in";
            return false;
        }
    }
    logout() {
        if (this._loggedIn) {
            let data = {
                'commit': ""
            }
            return this.http("https://ask.fm/logout", "https://ask.fm/account/wall", true, data);
        }
        this._loggedIn = false;
    }
    registerAccount(proxy = null, count = 1, forceCookies = false) {

        if (!this._loggedIn) {
            co(registerAccount(this, proxy, count, forceCookies))
        }
    }
    requestRandom(count = 1) {
        let promises = []
        for (let i = 0; i < count; i++) {
            let promise = this.get_token().then(token => {
                return this.http("https://ask.fm/account/inbox/random-question", "https://ask.fm/account/inbox/", true, {}, token)
            })
            promises.push(promise)
        }
        let race = Promise.race(promises)
        return race
    }
    fetchQuestions() {
        if (this._loggedIn) {
            let questions = {}
            return this.http("https://ask.fm/account/inbox", "https://ask.fm/account/wall").then(page => {
                let regex = /\/account\/private-questions\/([0-9]+)" /g
                //console.log("PAGE OF QUESTIOSNs",page)
                let result, ids = new Set()
                while ((result = regex.exec(page))) {
                    console.log("in loop once")
                    var Link = result[1];
                    var Match = result[0];
                    ids.add(Link)
                }
                ids = Array.from(ids)
                let links = ids.map(id => {
                    return "https://ask.fm/account/private-questions/" + id
                })
                return links
            })
        } else {
            this.lastError = "Not logged in";
            return false;
        }
    }
    answer(questionId, text, imageUrl = false) {
        if (this._loggedIn) {
            let token = this.get_token().then(token => {
                let data = {
                    question: {
                        answer_text: text,
                        answer_type: "",
                        thread_id: ""
                    },
                    authenticity_token: token
                }
                if (imageUrl) data.question.photo_url = imageUrl
                //console.log("sending answer", data, "https://ask.fm/account/private-questions/" + questionId)
                return this.http("https://ask.fm/account/private-questions/" + questionId, "https://ask.fm/account/private-questions/" + questionId, true, data);
            })
        } else {
            this.lastError = "Not logged in";
            return false;
        }
    }
    getStr(first, second, all) {
        let regex = new RegExp(first + "(.*)" + second)
        let result = regex.exec(all)
        if (result.length > 1) {
            //console.log("between", result[1])
            return result[1]
        } else {
            return null
        }
    }
}

function parseCookies(cookies) {
    let string = ""
    cookies.forEach(cookie => {
        cookieString = cookie.substring(0, cookie.indexOf(";"))
        if (!string) {
            string = cookieString
        } else {
            string += "; " + cookieString
        }
    })
    return string
    //console.log("the cookeis string", string)
}

function* registerAccount(self, proxy = null, count = 1, forceCookies = false) {
    //console.log("the count", count)
    for (let i = 0; i < count; i++) {
        let token = yield self.get_token(true);
        self.cookies = self.last_cookies;
        let a = yield getRandomUser()
        let u = a.results[0].login;
        z = a['results'][0];
        let username = z.login.username;
        let email = z.email.replace("@example.com", username + "@gmail.com")
        let password = u.password + u.salt
        let name = z.name.first + " " + z.name.last
        let data = {
            'authenticity_token': token,
            user: {
                gmt_offset: 420,
                login: username,
                password: password,
                name: name,
                email: email,
                born_at_day: getRandomInt(1, 28),
                born_at_month: getRandomInt(1, 12),
                born_at_year: getRandomInt(1965, 1998),
                language_code: "id"
            }
        }
        //console.log("signing up", data)
        let response = yield self.http('https://ask.fm/signup', 'https://ask.fm/signup', true, data, false, proxy);
        //console.log("sign up reponse", response)
        if (response.indexOf("/wall/i") > -1) {
            if (forceCookies) {
                this.cookies = this.last_cookies;
                let v = yield self.get_token();
                return self.last_cookies;
            } else {
                return {
                    username,
                    password
                }
            }

        }
    }
}

function getRandomUser() {
    return new Promise((resolve, reject) => {
        request("https://api.randomuser.me/?nat=us", (err, res) => {
            if (res && res.statusCode == 200) {
                if (typeof res.body !== "object") {
                    resolve(JSON.parse(res.body))
                } else {
                    resolve(res.body)
                }
            }
        })
    })
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
module.exports = askFm