var express = require('express');
var router = express.Router();
var modelsWx = require('../models/wx');
var urlencode = require('urlencode');
var urllib = require('urllib');
var sha1 = require('sha1');


var myAppid = "wx1dd9cc1253750335";
var myAppsecret = "f1e528760dae465393e1dac8e3bbd292";
var wxToken, wxExpires, wxticket, nowTime, wxUrl;

function randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

/* GET home page. */
router.get('/', function (req, res, next) {
    wxUrl = 'http://williamwx.ompchina.net' + req.url;
    modelsWx.getToken('wxTokens', function (err, wxJsSdk) {

        if (wxJsSdk) {
            nowTime = Date.now();
            if (wxJsSdk.pastTime.getTime() >= nowTime) {
                wxticket = wxJsSdk.ticket;
                wxappId = myAppid;
                wxtimestamp = nowTime;
                wxnonceStr = randomString(16);
                wxsignature = sha1('jsapi_ticket=' + wxticket + '&noncestr=' + wxnonceStr + '&timestamp=' + wxtimestamp + '&url=' + wxUrl);
                var outPram = {
                    pageTitle: '获取token:' + wxUrl,
                    title: '获取token:' + wxUrl,
                    wxappId: wxappId,
                    wxtimestamp: wxtimestamp,
                    wxnonceStr: wxnonceStr,
                    wxsignature: wxsignature
                };
                res.render('index', {'title': outPram});
                return;
            }
            else {
                //token过期 请求微信接口获取token 更新token
                urllib.request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + myAppid + '&secret=' + myAppsecret, {
                    method: 'GET',
                    dataType: 'json',
                    contentType: 'json'
                }, function (err, data) {
                    if (err) {
                        res.render('index', {title: err});
                    }
                    else {
                        wxToken = data.access_token;
                        wxExpires = data.expires_in;
                        urllib.request('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + wxToken + '&type=jsapi', {
                                method: 'GET',
                                dataType: 'json',
                                contentType: 'json'
                            }
                            ,
                            function (err, data) {
                                if (err) {
                                    res.render('index', {title: err});
                                }
                                else {
                                    if (data.errcode != 0) {
                                        res.render('index', {title: date.errmsg});
                                    }
                                    else {
                                        wxticket = data.ticket;
                                        modelsWx.updateToken({
                                            'token': wxToken,
                                            'overTime': wxExpires,
                                            'ticket': wxticket
                                        }, function () {
                                            wxappId = myAppid;
                                            wxtimestamp = nowTime;
                                            wxnonceStr = randomString(16);
                                            wxsignature = sha1('jsapi_ticket=' + wxticket + '&noncestr=' + wxnonceStr + '&timestamp=' + wxtimestamp + '&url=' + wxUrl);
                                            var outPram = {
                                                pageTitle: '更新token:' + wxUrl,
                                                title: '更新token:' + wxUrl,
                                                wxappId: wxappId,
                                                wxtimestamp: wxtimestamp,
                                                wxnonceStr: wxnonceStr,
                                                wxsignature: wxsignature
                                            };
                                            res.render('index', {'title': outPram});
                                        });
                                    }
                                }
                            }
                        );
                    }
                });
                modelsWx.updateToken({
                    'wxTokens': 'wxTokens',
                    'token': 'updateToken',
                    'overTime': 7200
                }, res.render('index', {title: '更新token成功'}));
                return;
            }
        }
        else {
            //未发现请求过token 请求微信接口获取token 保存token
            urllib.request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + myAppid + '&secret=' + myAppsecret, {
                method: 'GET',
                dataType: 'json',
                contentType: 'json'
            }, function (err, data) {
                if (err) {
                    res.render('index', {title: err});
                }
                else {
                    wxToken = data.access_token;
                    wxExpires = data.expires_in;
                    urllib.request('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + wxToken + '&type=jsapi', {
                            method: 'GET',
                            dataType: 'json',
                            contentType: 'json'
                        }
                        ,
                        function (err, data) {
                            if (err) {
                                res.render('index', {title: err});
                            }
                            else {
                                if (data.errcode != 0) {
                                    res.render('index', {title: date.errmsg});
                                }
                                else {
                                    wxticket = data.ticket;
                                    modelsWx.saveToken({
                                        'token': wxToken,
                                        'overTime': wxExpires,
                                        'ticket': wxticket
                                    }, function () {
                                        wxappId = myAppid;
                                        wxtimestamp = nowTime;
                                        wxnonceStr = randomString(16);
                                        wxsignature = sha1('jsapi_ticket=' + wxticket + '&noncestr=' + wxnonceStr + '&timestamp=' + wxtimestamp + '&url=' + wxUrl);
                                        var outPram = {
                                            pageTitle: '新增token:' + wxUrl,
                                            title: '新增token:' + wxUrl,
                                            wxappId: wxappId,
                                            wxtimestamp: wxtimestamp,
                                            wxnonceStr: wxnonceStr,
                                            wxsignature: wxsignature
                                        };
                                        res.render('index', {'title': outPram});
                                    });
                                }
                            }
                        }
                    );
                }
            });
            return;
        }
    })

//res.render('index', {title: '微信测试'});
})
;

module.exports = router;
