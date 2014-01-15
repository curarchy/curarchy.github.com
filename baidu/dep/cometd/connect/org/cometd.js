/*
 * Copyright (c) 2010 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.ya
 */

/**
 * changed by wangyaqiong
 * only support jsonp transport
 */

define(
    function (require) {
        this.org = this.org || {};
        org.cometd = {};

        org.cometd.JSON = {};
        org.cometd.JSON.toJSON = org.cometd.JSON.fromJSON = function (object) {
            throw 'Abstract';
        };

        var util = require("./cometdutil");
        org.cometd.Utils = {};

        org.cometd.Utils.isString = util.isString;
        org.cometd.Utils.isArray = util.isArray;
        org.cometd.Utils.inArray = util.inArray;
        org.cometd.Utils.setTimeout = util.setTimeout;
        org.cometd.Utils.clearTimeout = util.clearTimeout;
        org.cometd.Utils.derive = util.derive;

        /**
         * Base object with the common functionality for transports based on requests.
         * The key responsibility is to allow at most 2 outstanding requests to the server,
         * to avoid that requests are sent behind a long poll.
         * To achieve this, we have one reserved request for the long poll, and all other
         * requests are serialized one after the other.
         */
        org.cometd.RequestTransport = function () {
            var self = this;
            var requestIds = 0;
            var metaConnectRequest = null;
            var requests = [];
            var envelopes = [];

            var transtype;
            var reqCometd;

            function coalesceEnvelopes(envelope) {
                while (envelopes.length > 0) {
                    var envelopeAndRequest = envelopes[0];
                    var newEnvelope = envelopeAndRequest[0];
                    var newRequest = envelopeAndRequest[1];

                    if (newEnvelope.url === envelope.url && newEnvelope.sync === envelope.sync) {
                        envelopes.shift();
                        
                        envelope.messages = envelope.messages.concat(newEnvelope.messages);
                        continue;
                    }
                    break;
                }
            }

            function transportSendBase(envelope, request) {
                this.transportSend(envelope, request);
                request.expired = false;

                if (!envelope.sync) {
                    var maxDelay = this.getConfiguration().maxNetworkDelay;
                    var delay = maxDelay;

                    if (request.metaConnect === true) {
                        delay += this.getAdvice().timeout;
                    }
                    var self = this;
                    request.timeout = this.setTimeout(function () {
                        request.expired = true;
                        var errorMessage = 'Request ' + request.id + ' of transport ' + self.getType() + ' exceeded ' + delay + ' ms max network delay';
                        var failure = {
                            reason: errorMessage
                        };
                        var xhr = request.xhr;
                        
                        failure.httpCode = self.xhrStatus(xhr);
                        self.abortXHR(xhr);
                        self.complete(request, false, request.metaConnect);
                        envelope.onFailure(xhr, envelope.messages, failure);
                    }, delay);
                }
            }

            function queueSend(envelope) {
                var requestId = ++requestIds;
                var request = {
                    id: requestId,
                    metaConnect: false
                };

                // Consider the metaConnect requests which should always be present
                if (requests.length < this.getConfiguration().maxConnections - 1) {
                    requests.push(request);
                    transportSendBase.call(this, envelope, request);
                }
                else {
                    envelopes.push([envelope, request]);
                }
            }

            function metaConnectComplete(request) {
                var requestId = request.id;
                if (metaConnectRequest !== null && metaConnectRequest.id !== requestId)
                {
                    throw 'Longpoll request mismatch, completing request ' + requestId;
                }

                // Reset metaConnect request
                metaConnectRequest = null;
            }

            function completeBase(request, success) {
                var index = org.cometd.Utils.inArray(request, requests);
                // The index can be negative if the request has been aborted
                if (index >= 0) {
                    requests.splice(index, 1);
                }

                if (envelopes.length > 0) {
                    var envelopeAndRequest = envelopes.shift();
                    var nextEnvelope = envelopeAndRequest[0];
                    var nextRequest = envelopeAndRequest[1];

                    if (success) {
                        if (this.getConfiguration().autoBatch) {
                            coalesceEnvelopes.call(this, nextEnvelope);
                        }

                        queueSend.call(this, nextEnvelope);
                    }
                    else {
                        // Keep the semantic of calling response callbacks asynchronously after the request
                        var self = this;
                        this.setTimeout(function() {
                            self.complete(nextRequest, false, nextRequest.metaConnect);
                            var failure = {
                                reason: 'Previous request failed'
                            };

                            var xhr = nextRequest.xhr;
                            failure.httpCode = self.xhrStatus(xhr);
                            nextEnvelope.onFailure(xhr, nextEnvelope.messages, failure);
                        }, 0);
                    }
                }
            }

            self.complete = function (request, success, metaConnect) {
                if (metaConnect) {
                    metaConnectComplete.call(this, request);
                }
                else {
                    completeBase.call(this, request, success);
                }
            };

            self.transportSuccess = function (envelope, request, responses) {
                if (!request.expired) {
                    this.clearTimeout(request.timeout);
                    this.complete(request, true, request.metaConnect);

                    if (responses && responses.length > 0) {
                        envelope.onSuccess(responses);
                    }
                    else {
                        envelope.onFailure(request.xhr, envelope.messages, {
                            httpCode: 204
                        });
                    }
                }
            };

            self.transportFailure = function(envelope, request, failure) {
                if (!request.expired) {
                    this.clearTimeout(request.timeout);
                    this.complete(request, false, request.metaConnect);
                    envelope.onFailure(request.xhr, envelope.messages, failure);
                }
            };

            function metaConnectSend(envelope) {
                if (metaConnectRequest !== null) {
                    throw 'Concurrent metaConnect requests not allowed, request id=' + metaConnectRequest.id + ' not yet completed';
                }

                var requestId = ++requestIds;
                var request = {
                    id: requestId,
                    metaConnect: true
                };
                transportSendBase.call(this, envelope, request);
                metaConnectRequest = request;
            }

            self.send = function(envelope, metaConnect) {
                if (metaConnect) {
                    metaConnectSend.call(this, envelope);
                }
                else {
                    queueSend.call(this, envelope);
                }
            };

            self.abort = function() {
                this.reset();
            };

            self.reset = function() {
                metaConnectRequest = null;
                requests = [];
                envelopes = [];
            };

            self.abortXHR = function(xhr) {
                if (xhr) {
                    try
                    {
                        xhr.abort();
                    }
                    catch (x)
                    {
                    }
                }
            };

            self.xhrStatus = function(xhr) {
                if (xhr) {
                    try {
                        return xhr.status;
                    }
                    catch (x)
                    {
                    }
                }
                return -1;
            };

            this.registered = function (type, cometd) {
                transtype = type;
                reqCometd = cometd;
            };

            this.unregistered = function () {
                transtype = null;
                reqCometd = null;
            };

            this.mixin = function () {
                return reqCometd._mixin.apply(reqCometd, arguments);
            };

            this.getConfiguration = function () {
                return reqCometd.getConfiguration();
            };

            this.getAdvice = function () {
                return reqCometd.getAdvice();
            };

            this.setTimeout = function (funktion, delay) {
                return org.cometd.Utils.setTimeout(reqCometd, funktion, delay);
            };

            this.clearTimeout = function (handle) {
                org.cometd.Utils.clearTimeout(handle);
            };

            this.convertToMessages = function (response) {
                if (org.cometd.Utils.isString(response)) {
                    try {
                        return org.cometd.JSON.fromJSON(response);
                    }
                    catch (x) {
                        throw x;
                    }
                }
                if (org.cometd.Utils.isArray(response)) {
                    return response;
                }
                if (response === undefined || response === null) {
                    return [];
                }
                if (response instanceof Object) {
                    return [response];
                }
                throw 'Conversion Error ' + response + ', typeof ' + (typeof response);
            };

            this.getType = function () {
                return transtype;
            };

            this.toString = function () {
                return this.getType();
            };

            return self;
        };


        org.cometd.CallbackPollingTransport = function () {
            var superTranport = new org.cometd.RequestTransport();
            var self = org.cometd.Utils.derive(superTranport);
            var maxLength = 2000;

            self.accept = function (version, crossDomain, url) {
                return true;
            };

            self.jsonpSend = function (packet) {
                throw 'Abstract';
            };

            self.transportSend = function (envelope, request) {
                var self = this;

                // Microsoft Internet Explorer has a 2083 URL max length
                // We must ensure that we stay within that length
                var start = 0;
                var length = envelope.messages.length;
                var lengths = [];

                while (length > 0) {
                    // Encode the messages because all brackets, quotes, commas, colons, etc
                    // present in the JSON will be URL encoded, taking many more characters
                    var json = org.cometd.JSON.toJSON(envelope.messages.slice(start, start + length));
                    var urlLength = envelope.url.length + encodeURI(json).length;

                    // Let's stay on the safe side and use 2000 instead of 2083
                    // also because we did not count few characters among which
                    // the parameter name 'message' and the parameter 'jsonp',
                    // which sum up to about 50 chars
                    if (urlLength > maxLength) {
                        if (length === 1) {
                            // Keep the semantic of calling response callbacks asynchronously after the request
                            this.setTimeout(function () {
                                self.transportFailure(envelope, request, {
                                    reason: 'Bayeux message too big, max is ' + maxLength
                                });
                            }, 0);
                            return;
                        }

                        --length;
                        continue;
                    }

                    lengths.push(length);
                    start += length;
                    length = envelope.messages.length - start;
                }

                // Here we are sure that the messages can be sent within the URL limit

                var envelopeToSend = envelope;
                if (lengths.length > 1) {
                    var begin = 0;
                    var end = lengths[0];
                    envelopeToSend = this.mixin(false, {}, envelope);
                    envelopeToSend.messages = envelope.messages.slice(begin, end);
                    envelopeToSend.onSuccess = envelope.onSuccess;
                    envelopeToSend.onFailure = envelope.onFailure;

                    for (var i = 1; i < lengths.length; ++i) {
                        var nextEnvelope = this.mixin(false, {}, envelope);
                        begin = end;
                        end += lengths[i];

                        nextEnvelope.messages = envelope.messages.slice(begin, end);
                        nextEnvelope.onSuccess = envelope.onSuccess;
                        nextEnvelope.onFailure = envelope.onFailure;
                        this.send(nextEnvelope, request.metaConnect);
                    }
                }

                try {
                    var sameStack = true;

                    this.jsonpSend({
                        transport: this,
                        url: envelopeToSend.url,
                        body: org.cometd.JSON.toJSON(envelopeToSend.messages),
                        onSuccess: function (responses) {
                            var success = false;
                            try {
                                var received = self.convertToMessages(responses);
                                
                                if (received.length === 0) {
                                    self.transportFailure(envelopeToSend, request, {
                                        httpCode: 204
                                    });
                                }
                                else {
                                    success = true;
                                    self.transportSuccess(envelopeToSend, request, received);
                                }
                            }
                            catch (x) {
                                if (!success) {
                                    self.transportFailure(envelopeToSend, request, {
                                        exception: x
                                    });
                                }
                            }
                        },
                        onError: function (reason, exception) {
                            var failure = {
                                reason: reason,
                                exception: exception
                            };
                            if (sameStack) {
                                // Keep the semantic of calling response callbacks asynchronously after the request
                                self.setTimeout(function() {
                                    self.transportFailure(envelopeToSend, request, failure);
                                }, 0);
                            }
                            else {
                                self.transportFailure(envelopeToSend, request, failure);
                            }
                        }
                    });
                    sameStack = false;
                }
                catch (xx) {
                    // Keep the semantic of calling response callbacks asynchronously after the request
                    this.setTimeout(function() {
                        self.transportFailure(envelopeToSend, request, {
                            exception: xx
                        });
                    }, 0);
                }
            };

            return self;
        };


        /**
         * The constructor for a Cometd object, identified by an optional name.
         * The default name is the string 'default'.
         * In the rare case a page needs more than one Bayeux conversation,
         * a new instance can be created via:
         * <pre>
         * var bayeuxUrl2 = ...;
         *
         * // Dojo style
         * var cometd2 = new dojox.Cometd('another_optional_name');
         *
         * // jQuery style
         * var cometd2 = new $.Cometd('another_optional_name');
         *
         * cometd2.init({url: bayeuxUrl2});
         * </pre>
         * @param name the optional name of this cometd object
         */
        // IMPLEMENTATION NOTES:
        // Be very careful in not changing the function order and pass this file every time through JSLint (http://jslint.com)
        // The only implied globals must be "dojo", "org" and "window", and check that there are no "unused" warnings
        // Failing to pass JSLint may result in shrinkers/minifiers to create an unusable file.
        org.cometd.Cometd = function(name)
        {
            var _cometd = this;
            var _name = name || 'default';
            var _crossDomain = false;
            var _transport;
            var _status = 'disconnected';
            var _messageId = 0;
            var _clientId = null;
            var _batch = 0;
            var _messageQueue = [];
            var _internalBatch = false;
            var _listeners = {};
            var _backoff = 0;
            var _scheduledSend = null;
            var _extensions = [];
            var _advice = {};
            var _handshakeProps;
            var _publishCallbacks = {};
            var _reestablish = false;
            var _connected = false;
            var _config = {
                connectTimeout: 0,
                maxConnections: 2,
                backoffIncrement: 1000,
                maxBackoff: 60000,
                reverseIncomingExtensions: true,
                maxNetworkDelay: 10000,
                requestHeaders: {},
                appendMessageTypeToURL: true,
                autoBatch: false,
                advice: {
                    timeout: 60000,
                    interval: 0,
                    reconnect: 'retry'
                }
            };

            function _fieldValue(object, name)
            {
                try
                {
                    return object[name];
                }
                catch (x)
                {
                    return undefined;
                }
            }

            /**
             * Mixes in the given objects into the target object by copying the properties.
             * @param deep if the copy must be deep
             * @param target the target object
             * @param objects the objects whose properties are copied into the target
             */
            this._mixin = function(deep, target, objects)
            {
                var result = target || {};

                // Skip first 2 parameters (deep and target), and loop over the others
                for (var i = 2; i < arguments.length; ++i)
                {
                    var object = arguments[i];

                    if (object === undefined || object === null)
                    {
                        continue;
                    }

                    for (var propName in object)
                    {
                        var prop = _fieldValue(object, propName);
                        var targ = _fieldValue(result, propName);

                        // Avoid infinite loops
                        if (prop === target)
                        {
                            continue;
                        }
                        // Do not mixin undefined values
                        if (prop === undefined)
                        {
                            continue;
                        }

                        if (deep && typeof prop === 'object' && prop !== null)
                        {
                            if (prop instanceof Array)
                            {
                                result[propName] = this._mixin(deep, targ instanceof Array ? targ : [], prop);
                            }
                            else
                            {
                                var source = typeof targ === 'object' && !(targ instanceof Array) ? targ : {};
                                result[propName] = this._mixin(deep, source, prop);
                            }
                        }
                        else
                        {
                            result[propName] = prop;
                        }
                    }
                }

                return result;
            };

            function _isString(value)
            {
                return org.cometd.Utils.isString(value);
            }

            function _isFunction(value)
            {
                if (value === undefined || value === null)
                {
                    return false;
                }
                return typeof value === 'function';
            }

            /**
             * Returns whether the given hostAndPort is cross domain.
             * The default implementation checks against window.location.host
             * but this function can be overridden to make it work in non-browser
             * environments.
             *
             * @param hostAndPort the host and port in format host:port
             * @return whether the given hostAndPort is cross domain
             */
            this._isCrossDomain = function(hostAndPort)
            {
                return hostAndPort && hostAndPort !== window.location.host;
            };

            function _configure(configuration)
            {// Support old style param, where only the Bayeux server URL was passed
                if (_isString(configuration))
                {
                    configuration = { url: configuration };
                }
                if (!configuration)
                {
                    configuration = {};
                }

                _config = _cometd._mixin(false, _config, configuration);

                if (!_config.url)
                {
                    throw 'Missing required configuration parameter \'url\' specifying the Bayeux server URL';
                }

                // Check if we're cross domain
                // [1] = protocol://, [2] = host:port, [3] = host, [4] = IPv6_host, [5] = IPv4_host, [6] = :port, [7] = port, [8] = uri, [9] = rest
                var urlParts = /(^https?:\/\/)?(((\[[^\]]+\])|([^:\/\?#]+))(:(\d+))?)?([^\?#]*)(.*)?/.exec(_config.url);
                var hostAndPort = urlParts[2];
                var uri = urlParts[8];
                var afterURI = urlParts[9];
                _crossDomain = _cometd._isCrossDomain(hostAndPort);

                // Check if appending extra path is supported
                if (_config.appendMessageTypeToURL)
                {
                    if (afterURI !== undefined && afterURI.length > 0)
                    {
                        _cometd._info('Appending message type to URI ' + uri + afterURI + ' is not supported, disabling \'appendMessageTypeToURL\' configuration');
                        _config.appendMessageTypeToURL = false;
                    }
                    else
                    {
                        var uriSegments = uri.split('/');
                        var lastSegmentIndex = uriSegments.length - 1;
                        if (uri.match(/\/$/))
                        {
                            lastSegmentIndex -= 1;
                        }
                        if (uriSegments[lastSegmentIndex].indexOf('.') >= 0)
                        {
                            // Very likely the CometD servlet's URL pattern is mapped to an extension, such as *.cometd
                            // It will be difficult to add the extra path in this case
                            _cometd._info('Appending message type to URI ' + uri + ' is not supported, disabling \'appendMessageTypeToURL\' configuration');
                            _config.appendMessageTypeToURL = false;
                        }
                    }
                }
            }

            function _clearSubscriptions()
            {
                for (var channel in _listeners)
                {
                    var subscriptions = _listeners[channel];
                    for (var i = 0; i < subscriptions.length; ++i)
                    {
                        var subscription = subscriptions[i];
                        if (subscription && !subscription.listener)
                        {
                            delete subscriptions[i];
                        }
                    }
                }
            }

            function _setStatus(newStatus)
            {
                if (_status !== newStatus)
                {
                   _status = newStatus;
                }
            }

            function _isDisconnected()
            {
                return _status === 'disconnecting' || _status === 'disconnected';
            }

            function _nextMessageId()
            {
                return ++_messageId;
            }

            function _applyExtension(scope, callback, name, message, outgoing)
            {
                try
                {
                    return callback.call(scope, message);
                }
                catch (x)
                {
                    var exceptionCallback = _cometd.onExtensionException;
                    if (_isFunction(exceptionCallback))
                    {
                        try
                        {
                            exceptionCallback.call(_cometd, x, name, outgoing, message);
                        }
                        catch(xx)
                        {
                            _cometd._info('Exception during execution of exception callback in extension', name, xx);
                        }
                    }
                    return message;
                }
            }

            function _applyIncomingExtensions(message)
            {
                for (var i = 0; i < _extensions.length; ++i)
                {
                    if (message === undefined || message === null)
                    {
                        break;
                    }

                    var index = _config.reverseIncomingExtensions ? _extensions.length - 1 - i : i;
                    var extension = _extensions[index];
                    var callback = extension.extension.incoming;
                    if (_isFunction(callback))
                    {
                        var result = _applyExtension(extension.extension, callback, extension.name, message, false);
                        message = result === undefined ? message : result;
                    }
                }
                return message;
            }

            function _applyOutgoingExtensions(message)
            {
                for (var i = 0; i < _extensions.length; ++i)
                {
                    if (message === undefined || message === null)
                    {
                        break;
                    }

                    var extension = _extensions[i];
                    var callback = extension.extension.outgoing;
                    if (_isFunction(callback))
                    {
                        var result = _applyExtension(extension.extension, callback, extension.name, message, true);
                        message = result === undefined ? message : result;
                    }
                }
                return message;
            }

            function _notify(channel, message)
            {
                var subscriptions = _listeners[channel];
                if (subscriptions && subscriptions.length > 0)
                {
                    for (var i = 0; i < subscriptions.length; ++i)
                    {
                        var subscription = subscriptions[i];
                        // Subscriptions may come and go, so the array may have 'holes'
                        if (subscription)
                        {
                            try
                            {
                                subscription.callback.call(subscription.scope, message);
                            }
                            catch (x)
                            {
                                var listenerCallback = _cometd.onListenerException;
                                if (_isFunction(listenerCallback))
                                {
                                   try
                                    {
                                        listenerCallback.call(_cometd, x, subscription.handle, subscription.listener, message);
                                    }
                                    catch (xx)
                                    {
                                        _cometd._info('Exception during execution of listener callback', subscription, xx);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            function _notifyListeners(channel, message)
            {
                // Notify direct listeners
                _notify(channel, message);

                // Notify the globbing listeners
                var channelParts = channel.split('/');
                var last = channelParts.length - 1;
                for (var i = last; i > 0; --i)
                {
                    var channelPart = channelParts.slice(0, i).join('/') + '/*';
                    // We don't want to notify /foo/* if the channel is /foo/bar/baz,
                    // so we stop at the first non recursive globbing
                    if (i === last)
                    {
                        _notify(channelPart, message);
                    }
                    // Add the recursive globber and notify
                    channelPart += '*';
                    _notify(channelPart, message);
                }
            }

            function _cancelDelayedSend()
            {
                if (_scheduledSend !== null)
                {
                    org.cometd.Utils.clearTimeout(_scheduledSend);
                }
                _scheduledSend = null;
            }

            function _delayedSend(operation)
            {
                _cancelDelayedSend();
                var delay = _advice.interval + _backoff;
                _scheduledSend = org.cometd.Utils.setTimeout(_cometd, operation, delay);
            }

            // Needed to break cyclic dependencies between function definitions
            var _handleMessages;
            var _handleFailure;

            /**
             * Delivers the messages to the CometD server
             * @param messages the array of messages to send
             * @param longpoll true if this send is a long poll
             */
            function _send(sync, messages, longpoll, extraPath)
            {
                // We must be sure that the messages have a clientId.
                // This is not guaranteed since the handshake may take time to return
                // (and hence the clientId is not known yet) and the application
                // may create other messages.
                for (var i = 0; i < messages.length; ++i)
                {
                    var message = messages[i];
                    message.id = '' + _nextMessageId();

                    if (_clientId)
                    {
                        message.clientId = _clientId;
                    }

                    var callback = undefined;
                    if (_isFunction(message._callback))
                    {
                        callback = message._callback;
                        // Remove the publish callback before calling the extensions
                        delete message._callback;
                    }

                    message = _applyOutgoingExtensions(message);
                    if (message !== undefined && message !== null)
                    {
                        messages[i] = message;
                        if (callback)
                            _publishCallbacks[message.id] = callback;
                    }
                    else
                    {
                        messages.splice(i--, 1);
                    }
                }

                if (messages.length === 0)
                {
                    return;
                }

                var url = _config.url;
                if (_config.appendMessageTypeToURL)
                {
                    // If url does not end with '/', then append it
                    if (!url.match(/\/$/))
                    {
                        url = url + '/';
                    }
                    if (extraPath)
                    {
                        url = url + extraPath;
                    }
                }

                var envelope = {
                    url: url,
                    sync: sync,
                    messages: messages,
                    onSuccess: function(rcvdMessages)
                    {
                        try
                        {
                            _handleMessages.call(_cometd, rcvdMessages);
                        }
                        catch (x)
                        {
                        }
                    },
                    onFailure: function(conduit, messages, failure)
                    {
                        try
                        {
                            failure.connectionType = _cometd.getTransport().getType();
                            _handleFailure.call(_cometd, conduit, messages, failure);
                        }
                        catch (x)
                        {}
                    }
                };
                _transport.send(envelope, longpoll);
            }

            function queueSend(message)
            {
                if (_batch > 0 || _internalBatch === true)
                {
                    _messageQueue.push(message);
                }
                else
                {
                    _send(false, [message], false);
                }
            }

            /**
             * Sends a complete bayeux message.
             * This method is exposed as a public so that extensions may use it
             * to send bayeux message directly, for example in case of re-sending
             * messages that have already been sent but that for some reason must
             * be resent.
             */
            this.send = queueSend;

            function _resetBackoff()
            {
                _backoff = 0;
            }

            function _increaseBackoff()
            {
                if (_backoff < _config.maxBackoff)
                {
                    _backoff += _config.backoffIncrement;
                }
            }

            /**
             * Starts a the batch of messages to be sent in a single request.
             * @see #_endBatch(sendMessages)
             */
            function _startBatch()
            {
                ++_batch;
            }

            function _flushBatch()
            {
                var messages = _messageQueue;
                _messageQueue = [];
                if (messages.length > 0)
                {
                    _send(false, messages, false);
                }
            }

            /**
             * Ends the batch of messages to be sent in a single request,
             * optionally sending messages present in the message queue depending
             * on the given argument.
             * @see #_startBatch()
             */
            function _endBatch()
            {
                --_batch;
                if (_batch < 0)
                {
                    throw 'Calls to startBatch() and endBatch() are not paired';
                }

                if (_batch === 0 && !_isDisconnected() && !_internalBatch)
                {
                    _flushBatch();
                }
            }

            /**
             * Sends the connect message
             */
            function _connect()
            {
                if (!_isDisconnected())
                {
                    var message = {
                        channel: '/meta/connect',
                        connectionType: _transport.getType()
                    };

                    // In case of reload or temporary loss of connection
                    // we want the next successful connect to return immediately
                    // instead of being held by the server, so that connect listeners
                    // can be notified that the connection has been re-established
                    if (!_connected)
                    {
                        message.advice = { timeout: 0 };
                    }

                    _setStatus('connecting');
                    _send(false, [message], true, 'connect');
                    _setStatus('connected');
                }
            }

            function _delayedConnect()
            {
                _setStatus('connecting');
                _delayedSend(function()
                {
                    _connect();
                });
            }

            function _updateAdvice(newAdvice)
            {
                if (newAdvice)
                {
                    _advice = _cometd._mixin(false, {}, _config.advice, newAdvice);
                }
            }

            function _disconnect(abort)
            {
                _cancelDelayedSend();
                if (abort)
                {
                    _transport.abort();
                }
                _clientId = null;
                _setStatus('disconnected');
                _batch = 0;
                _resetBackoff();

                // Fail any existing queued message
                if (_messageQueue.length > 0)
                {
                    _handleFailure.call(_cometd, undefined, _messageQueue, {
                        reason: 'Disconnected'
                    });
                    _messageQueue = [];
                }
            }

            /**
             * Sends the initial handshake message
             */
            function _handshake(handshakeProps)
            {
                _clientId = null;

                _clearSubscriptions();

                // Reset the transports if we're not retrying the handshake
                if (_isDisconnected())
                {
                    _transport.reset();
                    _updateAdvice(_config.advice);
                }
                else
                {
                    // We are retrying the handshake, either because another handshake failed
                    // and we're backing off, or because the server timed us out and asks us to
                    // re-handshake: in both cases, make sure that if the handshake succeeds
                    // the next action is a connect.
                    _updateAdvice(_cometd._mixin(false, _advice, {reconnect: 'retry'}));
                }

                _batch = 0;

                // Mark the start of an internal batch.
                // This is needed because handshake and connect are async.
                // It may happen that the application calls init() then subscribe()
                // and the subscribe message is sent before the connect message, if
                // the subscribe message is not held until the connect message is sent.
                // So here we start a batch to hold temporarily any message until
                // the connection is fully established.
                _internalBatch = true;

                // Save the properties provided by the user, so that
                // we can reuse them during automatic re-handshake
                _handshakeProps = handshakeProps;

                var version = '1.0';

                // Figure out the transports to send to the server
                //var transportTypes = _transports.findTransportTypes(version, _crossDomain, _config.url);
                var transportTypes = ['callback-polling'];

                var bayeuxMessage = {
                    version: version,
                    minimumVersion: '0.9',
                    channel: '/meta/handshake',
                    supportedConnectionTypes: transportTypes,
                    advice: {
                        timeout: _advice.timeout,
                        interval: _advice.interval
                    }
                };
                // Do not allow the user to mess with the required properties,
                // so merge first the user properties and *then* the bayeux message
                var message = _cometd._mixin(false, {}, _handshakeProps, bayeuxMessage);

                // We started a batch to hold the application messages,
                // so here we must bypass it and send immediately.
                _setStatus('handshaking');
                _send(false, [message], false, 'handshake');
            }

            function _delayedHandshake()
            {
                _setStatus('handshaking');

                // We will call _handshake() which will reset _clientId, but we want to avoid
                // that between the end of this method and the call to _handshake() someone may
                // call publish() (or other methods that call queueSend()).
                _internalBatch = true;

                _delayedSend(function()
                {
                    _handshake(_handshakeProps);
                });
            }

            function _failHandshake(message)
            {
                _notifyListeners('/meta/handshake', message);
                _notifyListeners('/meta/unsuccessful', message);

                // Only try again if we haven't been disconnected and
                // the advice permits us to retry the handshake
                var retry = !_isDisconnected() && _advice.reconnect !== 'none';
                if (retry)
                {
                    _increaseBackoff();
                    _delayedHandshake();
                }
                else
                {
                    _disconnect(false);
                }
            }

            function _handshakeResponse(message)
            {
                if (message.successful)
                {
                    // Save clientId, figure out transport, then follow the advice to connect
                    _clientId = message.clientId;

                    //only one type of transport now
                    var newTransport = _transport;

                    // End the internal batch and allow held messages from the application
                    // to go to the server (see _handshake() where we start the internal batch).
                    _internalBatch = false;
                    _flushBatch();

                    // Here the new transport is in place, as well as the clientId, so
                    // the listeners can perform a publish() if they want.
                    // Notify the listeners before the connect below.
                    message.reestablish = _reestablish;
                    _reestablish = true;
                    _notifyListeners('/meta/handshake', message);

                    var action = _isDisconnected() ? 'none' : _advice.reconnect;
                    switch (action)
                    {
                        case 'retry':
                            _resetBackoff();
                            _delayedConnect();
                            break;
                        case 'none':
                            _disconnect(false);
                            break;
                        default:
                            throw 'Unrecognized advice action ' + action;
                    }
                }
                else
                {
                    _failHandshake(message);
                }
            }

            function _handshakeFailure(failure)
            {
                _failHandshake({
                    successful: false,
                    failure: failure,
                    channel: '/meta/handshake',
                    advice: {
                        reconnect: 'retry',
                        interval: _backoff
                    }
                });
            }

            function _failConnect(message)
            {
                // Notify the listeners after the status change but before the next action
                _notifyListeners('/meta/connect', message);
                _notifyListeners('/meta/unsuccessful', message);

                // This may happen when the server crashed, the current clientId
                // will be invalid, and the server will ask to handshake again
                // Listeners can call disconnect(), so check the state after they run
                var action = _isDisconnected() ? 'none' : _advice.reconnect;
                switch (action)
                {
                    case 'retry':
                        _delayedConnect();
                        _increaseBackoff();
                        break;
                    case 'handshake':
                        // The current transport may be failed (e.g. network disconnection)
                        // Reset the transports so the new handshake picks up the right one
                        _transport.reset();
                        _resetBackoff();
                        _delayedHandshake();
                        break;
                    case 'none':
                        _disconnect(false);
                        break;
                    default:
                        throw 'Unrecognized advice action' + action;
                }
            }

            function _connectResponse(message)
            {
                _connected = message.successful;

                if (_connected)
                {
                    _notifyListeners('/meta/connect', message);

                    // Normally, the advice will say "reconnect: 'retry', interval: 0"
                    // and the server will hold the request, so when a response returns
                    // we immediately call the server again (long polling)
                    // Listeners can call disconnect(), so check the state after they run
                    var action = _isDisconnected() ? 'none' : _advice.reconnect;
                    switch (action)
                    {
                        case 'retry':
                            _resetBackoff();
                            _delayedConnect();
                            break;
                        case 'none':
                            _disconnect(false);
                            break;
                        default:
                            throw 'Unrecognized advice action ' + action;
                    }
                }
                else
                {
                    _failConnect(message);
                }
            }

            function _connectFailure(failure)
            {
                _connected = false;
                _failConnect({
                    successful: false,
                    failure: failure,
                    channel: '/meta/connect',
                    advice: {
                        reconnect: 'retry',
                        interval: _backoff
                    }
                });
            }

            function _failDisconnect(message)
            {
                _disconnect(true);
                _notifyListeners('/meta/disconnect', message);
                _notifyListeners('/meta/unsuccessful', message);
            }

            function _disconnectResponse(message)
            {
                if (message.successful)
                {
                    _disconnect(false);
                    _notifyListeners('/meta/disconnect', message);
                }
                else
                {
                    _failDisconnect(message);
                }
            }

            function _disconnectFailure(failure)
            {
                _failDisconnect({
                    successful: false,
                    failure: failure,
                    channel: '/meta/disconnect',
                    advice: {
                        reconnect: 'none',
                        interval: 0
                    }
                });
            }

            function _failSubscribe(message)
            {
                _notifyListeners('/meta/subscribe', message);
                _notifyListeners('/meta/unsuccessful', message);
            }

            function _subscribeResponse(message)
            {
                if (message.successful)
                {
                    _notifyListeners('/meta/subscribe', message);
                }
                else
                {
                    _failSubscribe(message);
                }
            }

            function _subscribeFailure(failure)
            {
                _failSubscribe({
                    successful: false,
                    failure: failure,
                    channel: '/meta/subscribe',
                    advice: {
                        reconnect: 'none',
                        interval: 0
                    }
                });
            }

            function _failUnsubscribe(message)
            {
                _notifyListeners('/meta/unsubscribe', message);
                _notifyListeners('/meta/unsuccessful', message);
            }

            function _unsubscribeResponse(message)
            {
                if (message.successful)
                {
                    _notifyListeners('/meta/unsubscribe', message);
                }
                else
                {
                    _failUnsubscribe(message);
                }
            }

            function _unsubscribeFailure(failure)
            {
                _failUnsubscribe({
                    successful: false,
                    failure: failure,
                    channel: '/meta/unsubscribe',
                    advice: {
                        reconnect: 'none',
                        interval: 0
                    }
                });
            }

            function _handlePublishCallback(message)
            {
                var callback = _publishCallbacks[message.id];
                if (_isFunction(callback))
                {
                    delete _publishCallbacks[message.id];
                    callback.call(_cometd, message);
                }
            }

            function _failMessage(message)
            {
                _handlePublishCallback(message);
                _notifyListeners('/meta/publish', message);
                _notifyListeners('/meta/unsuccessful', message);
            }

            function _messageResponse(message)
            {
                if (message.successful === undefined)
                {
                    if (message.data)
                    {
                        // It is a plain message, and not a bayeux meta message
                        _notifyListeners(message.channel, message);
                    }
                    else
                    {
                    }
                }
                else
                {
                    if (message.successful)
                    {
                        _handlePublishCallback(message);
                        _notifyListeners('/meta/publish', message);
                    }
                    else
                    {
                        _failMessage(message);
                    }
                }
            }

            function _messageFailure(message, failure)
            {
                _failMessage({
                    successful: false,
                    failure: failure,
                    channel: message.channel,
                    advice: {
                        reconnect: 'none',
                        interval: 0
                    }
                });
            }

            function _receive(message)
            {
                message = _applyIncomingExtensions(message);
                if (message === undefined || message === null)
                {
                    return;
                }

                _updateAdvice(message.advice);

                var channel = message.channel;
                switch (channel)
                {
                    case '/meta/handshake':
                        _handshakeResponse(message);
                        break;
                    case '/meta/connect':
                        _connectResponse(message);
                        break;
                    case '/meta/disconnect':
                        _disconnectResponse(message);
                        break;
                    case '/meta/subscribe':
                        _subscribeResponse(message);
                        break;
                    case '/meta/unsubscribe':
                        _unsubscribeResponse(message);
                        break;
                    default:
                        _messageResponse(message);
                        break;
                }
            }

            /**
             * Receives a message.
             * This method is exposed as a public so that extensions may inject
             * messages simulating that they had been received.
             */
            this.receive = _receive;

            _handleMessages = function(rcvdMessages)
            {
                for (var i = 0; i < rcvdMessages.length; ++i)
                {
                    var message = rcvdMessages[i];
                    _receive(message);
                }
            };

            _handleFailure = function(conduit, messages, failure)
            {
                for (var i = 0; i < messages.length; ++i)
                {
                    var message = messages[i];
                    var messageFailure = _cometd._mixin(false, { message: message, transport: conduit }, failure);
                    var channel = message.channel;
                    switch (channel)
                    {
                        case '/meta/handshake':
                            _handshakeFailure(messageFailure);
                            break;
                        case '/meta/connect':
                            _connectFailure(messageFailure);
                            break;
                        case '/meta/disconnect':
                            _disconnectFailure(messageFailure);
                            break;
                        case '/meta/subscribe':
                            _subscribeFailure(messageFailure);
                            break;
                        case '/meta/unsubscribe':
                            _unsubscribeFailure(messageFailure);
                            break;
                        default:
                            _messageFailure(message, messageFailure);
                            break;
                    }
                }
            };

            function _hasSubscriptions(channel)
            {
                var subscriptions = _listeners[channel];
                if (subscriptions)
                {
                    for (var i = 0; i < subscriptions.length; ++i)
                    {
                        if (subscriptions[i])
                        {
                            return true;
                        }
                    }
                }
                return false;
            }

            function _resolveScopedCallback(scope, callback)
            {
                var delegate = {
                    scope: scope,
                    method: callback
                };
                if (_isFunction(scope))
                {
                    delegate.scope = undefined;
                    delegate.method = scope;
                }
                else
                {
                    if (_isString(callback))
                    {
                        if (!scope)
                        {
                            throw 'Invalid scope ' + scope;
                        }
                        delegate.method = scope[callback];
                        if (!_isFunction(delegate.method))
                        {
                            throw 'Invalid callback ' + callback + ' for scope ' + scope;
                        }
                    }
                    else if (!_isFunction(callback))
                    {
                        throw 'Invalid callback ' + callback;
                    }
                }
                return delegate;
            }

            function _addListener(channel, scope, callback, isListener)
            {
                // The data structure is a map<channel, subscription[]>, where each subscription
                // holds the callback to be called and its scope.

                var delegate = _resolveScopedCallback(scope, callback);
                var subscription = {
                    channel: channel,
                    scope: delegate.scope,
                    callback: delegate.method,
                    listener: isListener
                };

                var subscriptions = _listeners[channel];
                if (!subscriptions)
                {
                    subscriptions = [];
                    _listeners[channel] = subscriptions;
                }

                // Pushing onto an array appends at the end and returns the id associated with the element increased by 1.
                // Note that if:
                // a.push('a'); var hb=a.push('b'); delete a[hb-1]; var hc=a.push('c');
                // then:
                // hc==3, a.join()=='a',,'c', a.length==3
                var subscriptionID = subscriptions.push(subscription) - 1;
                subscription.id = subscriptionID;
                subscription.handle = [channel, subscriptionID];
                // The subscription to allow removal of the listener is made of the channel and the index
                return subscription.handle;
            }

            function _removeListener(subscription)
            {
                var subscriptions = _listeners[subscription[0]];
                if (subscriptions)
                {
                    delete subscriptions[subscription[1]];
                }
            }

            //
            // PUBLIC API
            //

            /**
             * Registers the given transport under the given transport type.
             * The optional index parameter specifies the "priority" at which the
             * the only option is the jsonp now
             */
            this.registerTransport = function (type, transport, index) {
                _transport = transport;
                
                if (_isFunction(transport.registered)) {
                    transport.registered(type, this);
                }
            };

            /** 
             * Configures the initial Bayeux communication with the Bayeux server.
             * Configuration is passed via an object that must contain a mandatory field <code>url</code>
             * of type string containing the URL of the Bayeux server.
             * @param configuration the configuration object
             */
            this.configure = function(configuration)
            {
                _configure.call(this, configuration);
            };

            /**
             * Configures and establishes the Bayeux communication with the Bayeux server
             * via a handshake and a subsequent connect.
             * @param configuration the configuration object
             * @param handshakeProps an object to be merged with the handshake message
             * @see #configure(configuration)
             * @see #handshake(handshakeProps)
             */
            this.init = function(configuration, handshakeProps)
            {
                this.configure(configuration);
                this.handshake(handshakeProps);
            };

            /**
             * Establishes the Bayeux communication with the Bayeux server
             * via a handshake and a subsequent connect.
             * @param handshakeProps an object to be merged with the handshake message
             */
            this.handshake = function(handshakeProps)
            {
                _setStatus('disconnected');
                _reestablish = false;
                _handshake(handshakeProps);
            };

            /**
             * Disconnects from the Bayeux server.
             * It is possible to suggest to attempt a synchronous disconnect, but this feature
             * may only be available in certain transports (for example, long-polling may support
             * it, callback-polling certainly does not).
             * @param sync whether attempt to perform a synchronous disconnect
             * @param disconnectProps an object to be merged with the disconnect message
             */
            this.disconnect = function(sync, disconnectProps)
            {
                if (_isDisconnected())
                {
                    return;
                }

                if (disconnectProps === undefined)
                {
                    if (typeof sync !== 'boolean')
                    {
                        disconnectProps = sync;
                        sync = false;
                    }
                }

                var bayeuxMessage = {
                    channel: '/meta/disconnect'
                };
                var message = this._mixin(false, {}, disconnectProps, bayeuxMessage);
                _setStatus('disconnecting');
                _send(sync === true, [message], false, 'disconnect');
            };

            /**
             * Marks the start of a batch of application messages to be sent to the server
             * in a single request, obtaining a single response containing (possibly) many
             * application reply messages.
             * Messages are held in a queue and not sent until {@link #endBatch()} is called.
             * If startBatch() is called multiple times, then an equal number of endBatch()
             * calls must be made to close and send the batch of messages.
             * @see #endBatch()
             */
            this.startBatch = function()
            {
                _startBatch();
            };

            /**
             * Marks the end of a batch of application messages to be sent to the server
             * in a single request.
             * @see #startBatch()
             */
            this.endBatch = function()
            {
                _endBatch();
            };

            /**
             * Executes the given callback in the given scope, surrounded by a {@link #startBatch()}
             * and {@link #endBatch()} calls.
             * @param scope the scope of the callback, may be omitted
             * @param callback the callback to be executed within {@link #startBatch()} and {@link #endBatch()} calls
             */
            this.batch = function(scope, callback)
            {
                var delegate = _resolveScopedCallback(scope, callback);
                this.startBatch();
                try
                {
                    delegate.method.call(delegate.scope);
                    this.endBatch();
                }
                catch (x)
                {
                    this.endBatch();
                    throw x;
                }
            };

            /**
             * Adds a listener for bayeux messages, performing the given callback in the given scope
             * when a message for the given channel arrives.
             * @param channel the channel the listener is interested to
             * @param scope the scope of the callback, may be omitted
             * @param callback the callback to call when a message is sent to the channel
             * @returns the subscription handle to be passed to {@link #removeListener(object)}
             * @see #removeListener(subscription)
             */
            this.addListener = function(channel, scope, callback)
            {
                if (arguments.length < 2)
                {
                    throw 'Illegal arguments number: required 2, got ' + arguments.length;
                }
                if (!_isString(channel))
                {
                    throw 'Illegal argument type: channel must be a string';
                }

                return _addListener(channel, scope, callback, true);
            };

            /**
             * Removes the subscription obtained with a call to {@link #addListener(string, object, function)}.
             * @param subscription the subscription to unsubscribe.
             * @see #addListener(channel, scope, callback)
             */
            this.removeListener = function(subscription)
            {
                if (!org.cometd.Utils.isArray(subscription))
                {
                    throw 'Invalid argument: expected subscription, not ' + subscription;
                }

                _removeListener(subscription);
            };

            /**
             * Removes all listeners registered with {@link #addListener(channel, scope, callback)} or
             * {@link #subscribe(channel, scope, callback)}.
             */
            this.clearListeners = function()
            {
                _listeners = {};
            };

            /**
             * Subscribes to the given channel, performing the given callback in the given scope
             * when a message for the channel arrives.
             * @param channel the channel to subscribe to
             * @param scope the scope of the callback, may be omitted
             * @param callback the callback to call when a message is sent to the channel
             * @param subscribeProps an object to be merged with the subscribe message
             * @return the subscription handle to be passed to {@link #unsubscribe(object)}
             */
            this.subscribe = function(channel, scope, callback, subscribeProps)
            {
                if (arguments.length < 2)
                {
                    throw 'Illegal arguments number: required 2, got ' + arguments.length;
                }
                if (!_isString(channel))
                {
                    throw 'Illegal argument type: channel must be a string';
                }
                if (_isDisconnected())
                {
                    throw 'Illegal state: already disconnected';
                }

                // Normalize arguments
                if (_isFunction(scope))
                {
                    subscribeProps = callback;
                    callback = scope;
                    scope = undefined;
                }

                // Only send the message to the server if this client has not yet subscribed to the channel
                var send = !_hasSubscriptions(channel);

                var subscription = _addListener(channel, scope, callback, false);

                if (send)
                {
                    // Send the subscription message after the subscription registration to avoid
                    // races where the server would send a message to the subscribers, but here
                    // on the client the subscription has not been added yet to the data structures
                    var bayeuxMessage = {
                        channel: '/meta/subscribe',
                        subscription: channel
                    };
                    var message = this._mixin(false, {}, subscribeProps, bayeuxMessage);
                    queueSend(message);
                }

                return subscription;
            };

            /**
             * Unsubscribes the subscription obtained with a call to {@link #subscribe(string, object, function)}.
             * @param subscription the subscription to unsubscribe.
             */
            this.unsubscribe = function(subscription, unsubscribeProps)
            {
                if (arguments.length < 1)
                {
                    throw 'Illegal arguments number: required 1, got ' + arguments.length;
                }
                if (_isDisconnected())
                {
                    throw 'Illegal state: already disconnected';
                }

                // Remove the local listener before sending the message
                // This ensures that if the server fails, this client does not get notifications
                this.removeListener(subscription);

                var channel = subscription[0];
                // Only send the message to the server if this client unsubscribes the last subscription
                if (!_hasSubscriptions(channel))
                {
                    var bayeuxMessage = {
                        channel: '/meta/unsubscribe',
                        subscription: channel
                    };
                    var message = this._mixin(false, {}, unsubscribeProps, bayeuxMessage);
                    queueSend(message);
                }
            };

            /**
             * Removes all subscriptions added via {@link #subscribe(channel, scope, callback, subscribeProps)},
             * but does not remove the listeners added via {@link addListener(channel, scope, callback)}.
             */
            this.clearSubscriptions = function()
            {
                _clearSubscriptions();
            };

            /**
             * Publishes a message on the given channel, containing the given content.
             * @param channel the channel to publish the message to
             * @param content the content of the message
             * @param publishProps an object to be merged with the publish message
             */
            this.publish = function(channel, content, publishProps, publishCallback)
            {
                if (arguments.length < 1)
                {
                    throw 'Illegal arguments number: required 1, got ' + arguments.length;
                }
                if (!_isString(channel))
                {
                    throw 'Illegal argument type: channel must be a string';
                }
                if (_isDisconnected())
                {
                    throw 'Illegal state: already disconnected';
                }

                if (_isFunction(content))
                {
                    publishCallback = content;
                    content = publishProps = {};
                }
                else if (_isFunction(publishProps))
                {
                    publishCallback = publishProps;
                    publishProps = {};
                }

                var bayeuxMessage = {
                    channel: channel,
                    data: content,
                    _callback: publishCallback
                };
                var message = this._mixin(false, {}, publishProps, bayeuxMessage);
                queueSend(message);
            };

            /**
             * Returns a string representing the status of the bayeux communication with the Bayeux server.
             */
            this.getStatus = function()
            {
                return _status;
            };

            /**
             * Returns whether this instance has been disconnected.
             */
            this.isDisconnected = _isDisconnected;

            /**
             * Sets the backoff period used to increase the backoff time when retrying an unsuccessful or failed message.
             * Default value is 1 second, which means if there is a persistent failure the retries will happen
             * after 1 second, then after 2 seconds, then after 3 seconds, etc. So for example with 15 seconds of
             * elapsed time, there will be 5 retries (at 1, 3, 6, 10 and 15 seconds elapsed).
             * @param period the backoff period to set
             * @see #getBackoffIncrement()
             */
            this.setBackoffIncrement = function(period)
            {
                _config.backoffIncrement = period;
            };

            /**
             * Returns the backoff period used to increase the backoff time when retrying an unsuccessful or failed message.
             * @see #setBackoffIncrement(period)
             */
            this.getBackoffIncrement = function()
            {
                return _config.backoffIncrement;
            };

            /**
             * Returns the backoff period to wait before retrying an unsuccessful or failed message.
             */
            this.getBackoffPeriod = function()
            {
                return _backoff;
            };

            /**
             * Returns the name assigned to this Cometd object, or the string 'default'
             * if no name has been explicitly passed as parameter to the constructor.
             */
            this.getName = function()
            {
                return _name;
            };

            /**
             * Returns the clientId assigned by the Bayeux server during handshake.
             */
            this.getClientId = function()
            {
                return _clientId;
            };

            /**
             * Returns the URL of the Bayeux server.
             */
            this.getURL = function()
            {
                return _config.url;
            };

            this.getTransport = function()
            {
                return _transport;
            };

            this.getConfiguration = function()
            {
                return this._mixin(true, {}, _config);
            };

            this.getAdvice = function()
            {
                return this._mixin(true, {}, _advice);
            };
        };
                
        return org.cometd;
    }
);



