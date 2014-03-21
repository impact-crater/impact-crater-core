Fs      = require 'fs'
Log     = require 'log'
Path    = require 'path'
Fork    = require('child_process').fork

class Server
  constructor: (opts) ->
    @options = opts
    @logger = new Log(opts.logging)
    @serverPath = Fs.realpathSync(@options.path) + '/server/'
    @startPath = "#{@serverPath}start.js"

  run: ->
    serverProcess = Fork @startPath, [@serverPath]
    @logger.info "Starting server, port=#{@options.port}, pid=#{serverProcess.pid}"

    # serverProcess
    #   .on 'message', (message) =>
    #     @logger.info "Server: #{message}"
    #   .on 'close', (code, signal) =>
    #     @logger.info "Server closed: #{signal}"
    #   .on 'exit', (code, signal) =>
    #     @logger.info "Server exited: #{signal}"
    #   .on 'error', (err) =>
    #     @logger.error "Server Error: #{err}"

    # serverProcess.stdout.on 'data', (data) =>
    #   @logger.info "Server: #{data}"

module.exports = Server
