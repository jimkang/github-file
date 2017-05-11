github-file
==================

A module for retrieving and updating files on GitHub via the GitHub API.

Installation
------------

    npm install github-file

Usage
-----

    var GitHubFile = require('github-file');
    var request = require('basic-browser-request');

    var githubFile = GitHubFile({
      branch: 'gh-pages',
      gitRepoOwner: 'you-cooldev',
      gitToken: 'Token from GitHub API',
      repo: 'sunglasses-emoji-adder',
      request: request
    });

    githubFile.get('data/emoji.txt', updateEmojiFile);

    function updateEmojiFile(error, file) {
      if (error) {
        console.log(error);
      }
      else {
        console.log('File before updating': file.content);
        githubFile.update({filePath: 'data/emoji.text', content: file.content + '😎'}, logResult);
      }
    }

    function logResult(error, file) {
      if (error) {
        console.log(error);
      }
      else {
        console.log('File updated! Commit sha:': file.sha);
      }
    }

`update` has a `parentSha` opt that you can specify. If you do so, it will skip getting the existing file from git in order to get it the parent sha for the update.

Tests
-----

Run tests with `make test`.

License
-------

The MIT License (MIT)

Copyright (c) 2017 Jim Kang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
