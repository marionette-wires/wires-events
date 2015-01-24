import _ from 'lodash';
import {Mixin} from 'wires-metal';

/**
 * Regular expression used to split event strings.
 * @type {RegExp}
 */
const EVENT_SPLITTER = /\s+/;

/**
 * Implement fancy features of the Events API such as multiple event names
 * `"change blur"` and jQuery-style event maps `{change: action}` in terms of
 * the existing API.
 *
 * @private
 * @method _eventsApi
 */
function _eventsApi(obj, action, name, rest) {
  if (!name) {
    return true;
  }

  // Handle event maps.
  if (typeof name === 'object') {
    for (var key in name) {
      obj[action].apply(obj, [key, name[key]].concat(rest));
    }
    return false;
  }

  // Handle space separated event names.
  if (EVENT_SPLITTER.test(name)) {
    var names = name.split(EVENT_SPLITTER);
    for (var i = 0, length = names.length; i < length; i++) {
      obj[action].apply(obj, [names[i]].concat(rest));
    }
    return false;
  }

  return true;
}

/**
 * A difficult-to-believe, but optimized internal dispatch function for
 * triggering events. Tries to keep the usual cases speedy (most internal
 * Backbone events have 3 arguments).
 *
 * @private
 * @method _triggerEvents
 */
function _triggerEvents(events, args) {
  var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
  switch (args.length) {
    case 0: while (++i < l) { (ev = events[i]).callback.call(ev.ctx); } return;
    case 1: while (++i < l) { (ev = events[i]).callback.call(ev.ctx, a1); } return;
    case 2: while (++i < l) { (ev = events[i]).callback.call(ev.ctx, a1, a2); } return;
    case 3: while (++i < l) { (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); } return;
    default: while (++i < l) { (ev = events[i]).callback.apply(ev.ctx, args); } return;
  }
}

/**
 * A module that can be mixed in to *any object* in order to provide it with
 * custom events. You may bind with `on` or remove with `off` callback functions
 * to an event; `trigger`-ing an event fires all callbacks in succession.
 *
 * ```js
 * var object = {};
 * _.extend(object, Backbone.Events);
 * object.on('expand', function(){ alert('expanded'); });
 * object.trigger('expand');
 * ```
 *
 * @public
 * @mixin Events
 */
var Events = new Mixin({

  /**
   * Bind an event to a `callback` function. Passing `"all"` will bind the
   * callback to all events fired.
   *
   * @public
   * @method on
   */
  on(name, callback, context) {
    if (!_eventsApi(this, 'on', name, [callback, context]) || !callback) {
      return this;
    }

    this._events || (this._events = {});

    var events = this._events[name] || (this._events[name] = []);

    events.push({
      callback: callback,
      context: context,
      ctx: context || this
    });

    return this;
  },

  /**
   * Bind an event to only be triggered a single time. After the first time the
   * callback is invoked, it will be removed.
   *
   * @public
   * @method once
   */
  once(name, callback, context) {
    if (!_eventsApi(this, 'once', name, [callback, context]) || !callback) {
      return this;
    }

    var self = this;
    var once = _.once(function() {
      self.off(name, once);
      callback.apply(this, arguments);
    });

    once._callback = callback;

    return this.on(name, once, context);
  },

  /**
   * Remove one or many callbacks. If `context` is null, removes all callbacks
   * with that function. If `callback` is null, removes all callbacks for the
   * event. If `name` is null, removes all bound callbacks for all events.
   *
   * @public
   * @method off
   */
  off(name, callback, context) {
    if (!this._events || !_eventsApi(this, 'off', name, [callback, context])) {
      return this;
    }

    // Remove all callbacks for all events.
    if (!name && !callback && !context) {
      this._events = void 0;
      return this;
    }

    var names = name ? [name] : _.keys(this._events);
    for (var i = 0, length = names.length; i < length; i++) {
      name = names[i];

      // Bail out if there are no events stored.
      var events = this._events[name];
      if (!events) {
        continue;
      }

      // Remove all callbacks for this event.
      if (!callback && !context) {
        delete this._events[name];
        continue;
      }

      // Find any remaining events.
      var remaining = [];
      for (var j = 0, k = events.length; j < k; j++) {
        var event = events[j];
        if (
          callback && callback !== event.callback &&
          callback !== event.callback._callback ||
          context && context !== event.context
        ) {
          remaining.push(event);
        }
      }

      // Replace events if there are any remaining.  Otherwise, clean up.
      if (remaining.length) {
        this._events[name] = remaining;
      } else {
        delete this._events[name];
      }
    }

    return this;
  },

  /**
   * Trigger one or many events, firing all bound callbacks. Callbacks are
   * passed the same arguments as `trigger` is, apart from the event name
   * (unless you're listening on `"all"`, which will cause your callback to
   * receive the true name of the event as the first argument).
   *
   * @public
   * @method trigger
   */
  trigger(name, ...args) {
    if (!this._events) {
      return this;
    }

    if (!_eventsApi(this, 'trigger', name, args)) {
      return this;
    }

    var events = this._events[name];
    var allEvents = this._events.all;

    if (events) {
      _triggerEvents(events, args);
    }

    if (allEvents) {
      _triggerEvents(allEvents, arguments);
    }

    return this;
  },

  /**
   * Inversion-of-control versions of `on` and `once`. Tell *this* object to
   * listen to an event in another object ... keeping track of what it's
   * listening to.
   *
   * @public
   * @method listenTo
   */
  listenTo(obj, name, callback) {
    var listeningTo = this._listeningTo || (this._listeningTo = {});
    var id = obj._listenId || (obj._listenId = _.uniqueId('l'));

    listeningTo[id] = obj;

    if (!callback && typeof name === 'object') {
      callback = this;
    }

    obj.on(name, callback, this);

    return this;
  },

  /**
   * @public
   * @method listenToOnce
   */
  listenToOnce(obj, name, callback) {
    if (typeof name === 'object') {
      for (var event in name) {
        this.listenToOnce(obj, event, name[event]);
      }
      return this;
    }

    if (EVENT_SPLITTER.test(name)) {
      var names = name.split(EVENT_SPLITTER);
      for (var i = 0, length = names.length; i < length; i++) {
        this.listenToOnce(obj, names[i], callback);
      }
      return this;
    }

    if (!callback) {
      return this;
    }

    var once = _.once(function() {
      this.stopListening(obj, name, once);
      callback.apply(this, arguments);
    });

    once._callback = callback;

    return this.listenTo(obj, name, once);
  },

  /**
   * Tell this object to stop listening to either specific events ... or to
   * every object it's currently listening to.
   *
   * @public
   * @method stopListening
   */
  stopListening(obj, name, callback) {
    var listeningTo = this._listeningTo;

    if (!listeningTo) {
      return this;
    }

    var remove = !name && !callback;

    if (!callback && typeof name === 'object') {
      callback = this;
    }

    if (obj) {
      (listeningTo = {})[obj._listenId] = obj;
    }

    for (var id in listeningTo) {
      obj = listeningTo[id];
      obj.off(name, callback, this);

      if (remove || _.isEmpty(obj._events)) {
        delete this._listeningTo[id];
      }
    }

    return this;
  }

});

export default Events;
