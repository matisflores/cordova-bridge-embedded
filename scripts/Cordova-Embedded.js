var Embedded = function () {
    var obj = {
        isEmbedded: function () {
            return this.parent != null;
        },
        callbacks: {},
        binds: {},
        parent: null,
        _exec: function (cmd, params, callback) {
            cmd = cmd || null;
            params = params || [];
            callback = callback || null;

            if (this.parent && cmd) {
                if (callback)
                    this.binds[cmd] = this._bind(cmd, callback);
                this.parent.postMessage({
                    cmd: cmd,
                    params: params
                }, '*');
                return true;
            }
            return false;
        },
        _bind: function (event_name, callback) {
            if (event_name == 'Embedded.Initialized' && this.isEmbedded()) {
                callback();
                return true;
            }
            if (event_name && callback) {
                this.callbacks[event_name] = this.callbacks[event_name] || [];
                return (this.callbacks[event_name].push(callback) - 1);
            }
            return false;
        },
        _unbind: function (event_name, id) {
            if (typeof this.callbacks[event_name] === 'undefined'
                || typeof this.callbacks[event_name][id] === 'undefined')
                return false;
            this.callbacks[event_name].splice(id, 1);
            return true;
        },
        _dispatch: function (event_name, data) {
            data = data || null;
            var chain = this.callbacks[event_name];

            if (typeof chain === 'undefined')
                return false;

            if (chain.length === 1) {
                var func = typeof chain[0] === 'string' ? window[chain[0]]
                    : chain[0];
                setTimeout(function () {
                    if (func)
                        func(data);
                }, 10);
            } else
                setTimeout(
                    function () {
                        for (var i = 0; i < chain.length; i++) {
                            var func = typeof chain[i] === 'string' ? window[chain[i]]
                                : chain[i];
                            if (func)
                                func(data);
                        }
                    }, 10);
            return true;
        }
    };

    window.addEventListener('message',
	    function (event) {
	        if (event && event.data && event.data.event) {
	            obj._dispatch(event.data.event, event.data.data);
	        } else if (event && event.data && event.data.cmd
			    && event.data.cmd == 'Embedded.Initialize') {
	            obj.parent = event.source;
	            obj._dispatch('Embedded.Initialized');
	            event.data.cmd = 'Embedded.Initialized';
	            obj.parent.postMessage(event.data, '*');
	        } else if (event && event.data && event.data.cmd) {
	            obj._dispatch(event.data.cmd, event.data);
	            if (obj.binds[event.data.cmd] != undefined)
	                obj._unbind(event.data.cmd,
                        obj.binds[event.data.cmd]);
	        }
	    });

    return obj;
}();