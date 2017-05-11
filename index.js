'use strict';

var sb = require('standard-bail')();
var waterfall = require('async-waterfall');
var curry = require('lodash.curry');
var safeEncoders = require('./safe-encoders');
// var randomId = require('idmaker').randomId;

function GitHubFile(ctorOpts) {
  var githubAPIBase = 'https://api.github.com';
  var shouldSetUserAgent = false;
  var branch = 'master';
  var gitRepoOwner;
  var gitToken;
  var repo;
  var request;
  var encodeInBase64 = safeEncoders.encodeInBase64;
  var decodeFromBase64 = safeEncoders.decodeFromBase64;

  if (ctorOpts) {
    githubAPIBase = ctorOpts.githubAPIBase || 'https://api.github.com';
    shouldSetUserAgent = ctorOpts.shouldSetUserAgent !== undefined ? ctorOpts.shouldSetUserAgent : false;
    branch = ctorOpts.branch || 'master';
    gitRepoOwner = ctorOpts.gitRepoOwner;
    gitToken = ctorOpts.gitToken;
    repo = ctorOpts.repo;
    request = ctorOpts.request;
    encodeInBase64 = ctorOpts.encodeInBase64 || safeEncoders.encodeInBase64;
    decodeFromBase64 = ctorOpts.decodeFromBase64 || safeEncoders.decodeFromBase64;
  }

  var urlBase = githubAPIBase + '/repos/' + gitRepoOwner + '/' + repo + '/contents';

  return {
    update: updateFile,
    get: getFile
  };

  function getFile(filePath, done) {
    var reqOpts = {
      url: urlBase + '/' + filePath + '?access_token=' + gitToken,
      method: 'GET'
    };
    // console.log('Get from:', reqOpts.url);

    if (branch) {
      reqOpts.url += '&ref=' + branch;
    }

    if (shouldSetUserAgent) {
      reqOpts.headers = {
        'User-Agent': 'github-file module'
      };
    }
    request(reqOpts, sb(parseGetResponse, done));
  }

  function updateFile(opts, updateDone) {
    var filePath;
    var content;
    var message;
    var parentSha;

    if (opts) {
      filePath = opts.filePath;
      content = opts.content;
      message = opts.message;
      parentSha = opts.parentSha;
    }

    if (parentSha) {
      commitUpdate({ sha: parentSha }, updateDone);
    } else {
      waterfall([curry(getFile)(filePath), commitUpdate], updateDone);
    }

    function commitUpdate(existingFileInfo, done) {
      var reqOpts = {
        url: urlBase + '/' + filePath + '?access_token=' + gitToken,
        json: true,
        method: 'PUT',
        body: {
          message: message || 'Update from github-file module.',
          content: encodeInBase64(content),
          branch: branch,
          sha: existingFileInfo.sha
        }
      };

      if (shouldSetUserAgent) {
        reqOpts.headers = {
          'User-Agent': 'github-file module'
        };
      }
      // console.log('Commiting update with request:', JSON.stringify(reqOpts, null, '  '));

      request(reqOpts, sb(parsePutResponse, done));
    }

    function parsePutResponse(res, body, done) {
      if (res.statusCode === 201 || res.statusCode === 200) {
        done(null, body.commit);
      } else {
        done(new Error('Failed to update file: ' + filePath + ', ' + res.statusCode + ', ' + JSON.stringify(body)));
      }
    }
  }

  function parseGetResponse(res, body, done) {
    if (res.statusCode === 404) {
      // No error; there's just no list.
      done(null, []);
    } else if (res.statusCode === 200) {
      var parsed = JSON.parse(body);
      var result = {
        sha: parsed.sha,
        content: decodeFromBase64(parsed.content)
      };
      done(null, result);
    } else {
      done(new Error('Unknown error: ' + res.statusCode + ', ' + JSON.stringify(body)));
    }
  }
}

module.exports = GitHubFile;

