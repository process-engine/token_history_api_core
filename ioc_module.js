'use strict';

const TokenHistoryApiService = require('./dist/commonjs/index').TokenHistoryApiService;

function registerInContainer(container) {

  container
    .register('TokenHistoryApiService', TokenHistoryApiService)
    .dependencies('IamService', 'FlowNodeInstanceRepository')
    .singleton();
}

module.exports.registerInContainer = registerInContainer;
