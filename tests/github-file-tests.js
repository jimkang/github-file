/* global Buffer */

var test = require('tape');
var assertNoError = require('assert-no-error');
var GitHubFile = require('../index');
var config = require('../test-config');
var cloneDeep = require('lodash.clonedeep');
var { queue } = require('d3-queue');

var request;

if (typeof window === 'object') {
  // Don't use the Node request module for the browser test!
  request = require('basic-browser-request');
} else {
  request = require('request');
}

var encodeInBase64;
var decodeFromBase64;

if (typeof window !== 'object' || !window.btoa) {
  encodeInBase64 = function encodeFromBase64(s) {
    return Buffer.from(s, 'utf8').toString('base64');
  };
  decodeFromBase64 = function decodeFromBase64(s) {
    return Buffer.from(s, 'base64').toString('utf8');
  };
}

var randomId = require('idmaker').randomId;

var defaultCtorOpts = {
  gitRepoOwner: 'jimkang',
  repo: 'github-file-test',
  gitToken: config.github.token,
  request: request,
  encodeInBase64: encodeInBase64,
  decodeFromBase64: decodeFromBase64,
  shouldSetUserAgent: true
};

var testCases = [
  {
    filePath: 'directory-a/' + randomId(14) + '.txt',
    content: 'Hello, here is some content: ' + randomId(20)
  },
  {
    filePath:
      'directory-b/subdirectory-' + randomId(5) + '/' + randomId(14) + '.txt',
    content: 'Hello, here is some content: ' + randomId(20)
  },
  {
    filePath: 'directory-a/' + randomId(14) + '.txt',
    content: 'Hello, here is some content: ' + randomId(20)
  }
];

var q = queue(1);
testCases.forEach(queueTests);
q.awaitAll(conclude);

function queueTests(testCase) {
  q.defer(runUpdateTest, testCase);
  q.defer(runGetTest, testCase);
  q.defer(runUpdateWithSHATest, testCase);
}

function runGetTest(testCase, done) {
  test('Getting ' + testCase.filePath, getFileTest);

  function getFileTest(t) {
    var getFile = GitHubFile(defaultCtorOpts).get;
    getFile(testCase.filePath, checkRetrievedFile);

    function checkRetrievedFile(error, result) {
      assertNoError(t.ok, error, 'No error from getFile.');
      t.ok(result.sha, 'Result has a SHA.');
      t.equal(result.content, testCase.content, 'Content is correct.');
      console.log(
        'Please head over to https://github.com/jimkang/github-file-test/commits/ and manually inspect the commits created by these tests.'
      );
      t.end();
      done();
    }
  }
}

function runUpdateTest(testCase, done) {
  test('Updating ' + testCase.filePath, updateTest);

  function updateTest(t) {
    var updateFile = GitHubFile(defaultCtorOpts).update;
    updateFile(testCase, checkResult);

    function checkResult(error, commit) {
      assertNoError(t.ok, error, 'No error from updateFile.');
      t.ok(commit.sha, 'sha is passed.');
      t.end();
      done();
    }
  }
}

function runUpdateWithSHATest(testCase, done) {
  test('Getting ' + testCase.filePath, updateWithSHATest);

  function updateWithSHATest(t) {
    var githubFile = GitHubFile(defaultCtorOpts);
    githubFile.get(testCase.filePath, checkRetrievedFile);

    function checkRetrievedFile(error, result) {
      assertNoError(t.ok, error, 'No error from getFile.');
      t.ok(result.sha, 'Result has a SHA.');
      var updateOpts = cloneDeep(testCase);
      updateOpts.sha = result.sha;
      updateOpts.content += ' - updated!';
      githubFile.update(updateOpts, checkResult);
    }

    function checkResult(error, content) {
      assertNoError(t.ok, error, 'No error from updateFile.');
      t.ok(content.sha, 'sha is passed.');
      t.end();
      done();
    }
  }
}

function conclude(error) {
  if (error) {
    console.log('Concluded with error:', error);
  } else {
    console.log('Tests concluded.');
  }
}
