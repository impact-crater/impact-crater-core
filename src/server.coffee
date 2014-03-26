Fs      = require 'fs'
Log     = require 'log'
Path    = require 'path'
Fork    = require('child_process').fork

class Server
  constructor: (opts) ->
    @options = opts
    @logger = new Log(opts.logging)
    @serverPath = Fs.realpathSync(@options.path) + '/server'
    @startPath = "#{@serverPath}/start.js"

  run: ->
    config = require "#{@serverPath}/config"
    serverProcess = Fork @startPath, ['2>&1']
    @logger.info "Starting server, port=#{config.port}, pid=#{serverProcess.pid}"

module.exports = Server
