let askFm=require(__dirname+"/ask.js");


let cookie="uuid=22cede25-4f95-44b1-9ac6-8d71116eb336; country=EG; _ym_uid=1529714645860091501; _ym_d=1529714645; locale=en; OX_plg=pm; _ga=GA1.2.181929023.1530644781; _gid=GA1.2.573582337.1530644781; _ym_isad=1; hwid=E34BC-ACDB0_a129981983443235d8f965486b8e7675; _ym_visorc_48953915=b; _m_ask_fm_session=ZHhheERiUUdBbXRyQ1VzK3ZnRWV4MEl3M0g3OUVId2d1aDltdy81VnJ2cEFudzJjRDFzdVpCRnMrNVlYOWxEb3YrdFh5aDNMaDlNZGExcTRpNjBFY2JzdnpOQkxaRWRNMkI3NW05SDIyc2NkWUlwZ2xibGw5K2xzUm1yem9LNmI1eFlVZU9QYnB3QUFQS3Ztdk4rMFhZdDQ0WmZBSmxiTmdjOU5vTk9UWW5palRqSzZvZFVMRk1VUnNjaUttUXZsUkE5Skh3K3UvWW9vejJBVWUzL3lwemIzVXlHbDdORGhnU09ZVmY3Y201cz0tLXlvOU1zN2dXZkVDM2srbDROUm9GUnc9PQ%3D%3D--830668766d1e70f668fa402715968d7ab195b1ef";
let ask = new askFm();
//ask.registerAccount()

ask.login(cookie).then(done=>{
    //ask.ask('mohamed_ali4ev', 'question text',1); WORKED
   // ask.registerAccount()
})
