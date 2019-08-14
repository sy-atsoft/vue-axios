/* eslint-disable eqeqeq,no-console */

import axios from 'axios';
import Qs from 'qs';
import Cookies from 'js-cookie';

var extend = function (o, n) {
    if (o === 'undefined' || o === undefined) o = {};
    if (typeof o === 'string') {
        o = Qs.parse(o);
    }

    for (var p in n) {
        if (n.hasOwnProperty(p) && (!o.hasOwnProperty(p))) {
            o[p] = n[p];
        }
    }
    return Qs.stringify(o);
};

let util = {};
util.loginCode = 301
util.loginCall = null
util.errCall = null
util.ajaxUrl = '';
util.setUrl = function (url) {
    util.ajaxUrl = url;
}
util.ajax = axios.create({
    //retry: 1,
    timeout: 10000,
    retryDelay: 1000,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    withCredentials: true
});
// 添加请求拦截器
util.ajax.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    let auth = {};
    //if (Cookies.get('Token') && Cookies.get('HeaderKey')) {
    auth = {
        token: Cookies.get('Token') || '',
        HeaderKey: Cookies.get('HeaderKey') || ''
    };
    // }
    config.retry = util.retry || 0
    config.baseURL = util.ajaxUrl
    let data = extend(config.data, auth);
    config.data = data;
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});
util.ajax.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    response = response.data;
    if (typeof (response) !== 'object') {
        response = response.split('\n');
        try {
            if (response.length > 0) {
                response = response[response.length - 1];
                response = JSON.parse(response);
            }
        } catch (e) {
            return {
                errCode: 500,
                msg: '数据错误！类型：' + typeof (response),
                data: response
            };
        }
    }
    response.msg = response.msg || response.Msg || '';
    response.data = response.data || [];
    if (response.errCode === util.loginCode && typeof util.loginCall === "function") {
        util.loginCall(response)
    }
    return response;
}, function (error) {
    // 对响应错误做点什么
    var config = error.config;
    // If config does not exist or the retry option is not set, reject
    if (!config) return Promise.reject(error);
    // Set the variable for keeping track of the retry count
    config.__retryCount = config.__retryCount || 0;
    // Check if we've maxed out the total number of retries
    if (config.__retryCount >= config.retry) {
        // Reject with the error
        console.warn('请求超时达到' + (config.retry + 1) + '次,停止请求');
        let result = {
            errCode: 502,
            msg: 'time out'
        }
        if (typeof util.errCall === "function") {
            util.errCall(result)
        }
        return result
        //Promise.reject(error);
    }
    // Increase the retry count
    config.__retryCount += 1;
    // Create new promise to handle exponential backoff
    var backoff = new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, config.retryDelay || 1);
    });
    // Return the promise in which recalls axios to retry the request
    return backoff.then(function () {
        return util.ajax(config);
    });
});

util.install = function (Vue, options) {
    if (!options.baseUrl) {
        console.warn('baseUrl Error')
        return;
    }
    if (options.loginCode && options.loginCall) {
        util.loginCode = options.loginCode
        util.loginCall = options.loginCall
    } else {
        util.loginCode = 301
        util.loginCall = (res) => {
            console.warn('loginCall:' + res)
        }
    }
    if (options.errCall) {
        util.errCall = options.errCall
    } else {
        util.errCall = (res) => {
            console.warn('ErrData:' + res)
        }
    }
    util.setUrl(options.baseUrl)
    util.retry = options.retry
    // 添加实例方法
    Vue.prototype.$ajax = util.ajax
}

export default util;
