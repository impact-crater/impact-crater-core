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
    serverProcess = Fork @startPath, [@serverPath, '2>&1']
    @logger.info "Starting server, port=#{@options.port}, pid=#{serverProcess.pid}"

module.exports = Server
