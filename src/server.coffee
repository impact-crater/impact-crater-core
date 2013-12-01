Fs          = require 'fs'
Log         = require 'log'
Path        = require 'path'
{fork}  = require 'child_process'
{spawn} = require 'child_process'



class Server
  constructor: (path, opts) ->
    @path = path
    @options = opts
    @logger = new Log(opts.logging)

  run: ->
    serverProcess = spawn 'node',["#{@path}/server/start.js"]

    @logger.info "Starting server, port=#{@options.port}, pid=#{serverProcess.pid}"

    serverProcess
      .on 'message', (message) =>
        @logger.info "Server: #{message}"
      .on 'close', (code, signal) =>
        @logger.info "Server closed: #{signal}"
      .on 'exit', (code, signal) =>
        @logger.info "Server exited: #{signal}"
      .on 'error', (err) =>
        @logger.error "Server Error: #{err}"

    serverProcess.stdout.on 'data', (data)=>
      @logger.info "Server: #{data}"

module.exports = Server
