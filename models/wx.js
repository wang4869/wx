var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/wx');

var wxJsSdk = mongoose.Schema({
    wxTokens: {type: String, default: 'wxTokens'},
    token: {type: String},
    ticket: {type: String},
    lastTime: {type: Date, default: Date.now},
    pastTime: {type: Date}
});

var getJssdkFromMongo = mongoose.model('wxJsSdk', wxJsSdk); //与wx集合关联

//查找token
exports.getToken = function (wxTokens, callback) {
    getJssdkFromMongo.findOne({'wxTokens': wxTokens}, callback);
};
//保存token
exports.saveToken = function (tokenInfo, callback) {
    var getTokenInfo = new getJssdkFromMongo();
    getTokenInfo.wxTokens = 'wxTokens';
    getTokenInfo.token = tokenInfo.token;
    getTokenInfo.ticket = tokenInfo.ticket;
    getTokenInfo.lastTime = Date.now();
    getTokenInfo.pastTime = Date.now() + tokenInfo.overTime * 1000 - 200 * 1000;
    getTokenInfo.save(callback);
};
//更新token
exports.updateToken = function (tokenInfo, callback) {
    getJssdkFromMongo.update
    (
        {'wxTokens': tokenInfo.wxTokens},
        {
            $set: {
                token: tokenInfo.token,
                ticket: tokenInfo.ticket,
                pastTime: Date.now() + tokenInfo.overTime * 1000 - 200 * 1000,
                lastTime: Date.now()
            }
        },
        function (err) {
            if (err) {
                return;
            }
            else {

            }
        },
        callback
    );
};


