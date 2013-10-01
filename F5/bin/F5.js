#!/usr/bin/env node
var f5, nopt, path

nopt = require('nopt')
path = require('path')
f5 = require('../lib/f5')

f5.start(parseCommandParams())

function parseCommandParams(){
  return nopt({
    'port' : [String],
    'proxy' : [String],
    'path' : [Array, path]
  }, {}, process.argv, 2);
}