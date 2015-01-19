describe('Events', function() {
  beforeEach(function() {
    this.events = _.create(Events);
    this.target1 = _.create(Events);
    this.target2 = _.create(Events);
    this.callback1 = stub();
    this.callback2 = stub();
    this.context1 = {};
    this.context2 = {};
  });

  describe('trigger', function() {
    it('should return this', function() {
      expect(this.events.trigger()).to.equal(this.events);
    });

    it('should fire an event', function() {
      this.events.on('myEvent', this.callback1);

      this.events.trigger('myEvent', 'arg1', 'arg2');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg2');
    });

    it('should trigger multiple events from a space-separated list', function() {
      this.events.on('myEvent1', this.callback1);
      this.events.on('myEvent2', this.callback2);

      this.events.trigger('myEvent1 myEvent2', 'arg1', 'arg2');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg2');
      expect(this.callback2)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg2');
    });

    it('should trigger multiple events from an object', function() {
      this.events.on('myEvent1', this.callback1);
      this.events.on('myEvent2', this.callback2);

      this.events.trigger({
        myEvent1: 'arg1',
        myEvent2: 'arg2'
      }, 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg3', 'arg4');
      expect(this.callback2)
        .to.have.been.calledOnce
        .and.calledWith('arg2', 'arg3', 'arg4');
    });

    _.times(10, function(n) {
      var args = _.map(_.times(n), function(i) {
        return 'arg' + (i + 1);
      });

      it('should work with ' + n + ' arguments', function() {
        this.events.on('myEvent', this.callback1);

        this.events.trigger.apply(this.events, ['myEvent'].concat(args));

        var _expect = expect(this.callback1)
          .to.have.been.calledOnce;

        _expect.and.calledWith.apply(_expect, args);
      });
    });
  });

  describe('on', function() {
    it('should return this', function() {
      expect(this.events.on()).to.equal(this.events);
    });

    it('should call a callback on an event being fired', function() {
      this.events.on('myEvent', this.callback1);

      this.events.trigger('myEvent', 'arg1', 'arg2');
      this.events.trigger('myEvent', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledTwice
        .and.calledWith('arg1', 'arg2')
        .and.calledWith('arg3', 'arg4');
    });

    it('should call the callback with a default context of the evented object', function() {
      this.events.on('myEvent', this.callback1);

      this.events.trigger('myEvent', 'arg1', 'arg2');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg2')
        .and.calledOn(this.events);
    });

    it('should call the callback with a passed in context', function() {
      this.events.on('myEvent', this.callback1, this.context1);

      this.events.trigger('myEvent', 'arg1', 'arg2');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg2')
        .and.calledOn(this.context1);
    });

    it('should add listeners for multiple events from a space-separated list', function() {
      this.events.on('myEvent1 myEvent2', this.callback1, this.context1);

      this.events.trigger('myEvent1', 'arg1', 'arg2');
      this.events.trigger('myEvent2', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledTwice
        .and.calledWith('arg1', 'arg2')
        .and.calledWith('arg3', 'arg4')
        .and.always.calledOn(this.context1);
    });

    it('should add listener for multiple events from an object', function() {
      this.events.on({
        myEvent1: this.callback1,
        myEvent2: this.callback2
      }, this.context1);

      this.events.trigger('myEvent1', 'arg1', 'arg2');
      this.events.trigger('myEvent2', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg2')
        .and.calledOn(this.context1);
      expect(this.callback2)
        .to.have.been.calledOnce
        .and.calledWith('arg3', 'arg4')
        .and.calledOn(this.context1);
    });

    it('should have keyword "all" for adding listeners to all events', function() {
      this.events.on('all', this.callback1);

      this.events.trigger('myEvent1', 'arg1', 'arg2');
      this.events.trigger('myEvent2', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledTwice
        .and.calledWith('myEvent1', 'arg1', 'arg2')
        .and.calledWith('myEvent2', 'arg3', 'arg4');
    });
  });

  describe('once', function() {
    it('should return this', function() {
      expect(this.events.once()).to.equal(this.events);
    });

    it('should call a callback on an event being fired only once', function() {
      this.events.once('myEvent', this.callback1);

      this.events.trigger('myEvent', 'arg1', 'arg2');
      this.events.trigger('myEvent', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg2');
    });

    it('should call the callback with a default context of the evented object only once', function() {
      this.events.once('myEvent', this.callback1);

      this.events.trigger('myEvent', 'arg1', 'arg2');
      this.events.trigger('myEvent', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg2')
        .and.calledOn(this.events);
    });

    it('should call the callback with a passed in context only once', function() {
      this.events.once('myEvent', this.callback1, this.context1);

      this.events.trigger('myEvent', 'arg1', 'arg2');
      this.events.trigger('myEvent', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg2')
        .and.calledOn(this.context1);
    });

    it('should add listeners for multiple events from a space-separated list only once for each event', function() {
      this.events.once('myEvent1 myEvent2', this.callback1, this.context1);

      this.events.trigger('myEvent1', 'arg1', 'arg2');
      this.events.trigger('myEvent1', 'arg3', 'arg4');
      this.events.trigger('myEvent2', 'arg5', 'arg6');
      this.events.trigger('myEvent2', 'arg7', 'arg8');

      expect(this.callback1)
        .to.have.been.calledTwice
        .and.calledWith('arg1', 'arg2')
        .and.calledWith('arg5', 'arg6')
        .and.always.calledOn(this.context1);
    });

    it('should add listener for multiple events from an object only once for each event', function() {
      this.events.once({
        myEvent1: this.callback1,
        myEvent2: this.callback2
      }, this.context1);

      this.events.trigger('myEvent1', 'arg1', 'arg2');
      this.events.trigger('myEvent1', 'arg3', 'arg4');
      this.events.trigger('myEvent2', 'arg5', 'arg6');
      this.events.trigger('myEvent2', 'arg7', 'arg8');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg2')
        .and.calledOn(this.context1);
      expect(this.callback2)
        .to.have.been.calledOnce
        .and.calledWith('arg5', 'arg6')
        .and.calledOn(this.context1);
    });

    it('should have keyword "all" for adding listeners to all events', function() {
      this.events.once('all', this.callback1);

      this.events.trigger('myEvent1', 'arg1', 'arg2');
      this.events.trigger('myEvent2', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('myEvent1', 'arg1', 'arg2');
    });
  });

  describe('off', function() {
    it('should return this', function() {
      expect(this.events.off()).to.equal(this.events);
    });

    it('should remove all events with no args', function() {
      this.events.on('myEvent1', this.callback1, this.context1);
      this.events.on('myEvent2', this.callback2, this.context2);

      this.events.off();
      this.events.trigger('myEvent1');
      this.events.trigger('myEvent2');

      expect(this.callback1).not.to.have.been.called;
      expect(this.callback2).not.to.have.been.called;
    });

    _.each([
      { event: 'event1', success: true },
      { event: 'event2', success: false },
      { callback: 'callback1', success: true },
      { callback: 'callback2', success: false },
      { context: 'context1', success: true },
      { context: 'context2', success: false },
      { callback: 'callback2', success: false },
      { callback: 'callback1', context: 'context1', success: true },
      { callback: 'callback2', context: 'context1', success: false },
      { callback: 'callback1', context: 'context2', success: false },
      { event: 'event1', context: 'context1', success: true },
      { event: 'event2', context: 'context1', success: false },
      { event: 'event1', context: 'context2', success: false },
      { event: 'event2', callback: 'callback1', success: false },
      { event: 'event1', callback: 'callback2', success: false },
      { event: 'event1', callback: 'callback1', context: 'context1', success: true },
      { event: 'event2', callback: 'callback1', context: 'context1', success: false },
      { event: 'event1', callback: 'callback2', context: 'context1', success: false },
      { event: 'event1', callback: 'callback1', context: 'context2', success: false },
      { event: 'event2', callback: 'callback2', context: 'context1', success: false },
      { event: 'event2', callback: 'callback1', context: 'context2', success: false },
      { event: 'event1', callback: 'callback2', context: 'context2', success: false }
    ], function(test) {
      var text = 'should ' + (test.success ? '' : 'not ') + 'remove an existing event by ';
      var items = [];

      _.each(['event', 'callback', 'context'], function(type) {
        if (test[type]) {
          items.push((test[type] === type + '1' ? 'the same ' : 'a different ') + type);
        }
      });

      text += items.join(', ');

      it(text, function() {
        this.events.on('event1', this.callback1, this.context1);
        this.events.off(test.event, this[test.callback], this[test.context]);
        this.events.trigger('event1');

        if (test.success) {
          expect(this.callback1).not.to.have.been.called;
        } else {
          expect(this.callback1).to.have.been.called;
        }
      });

      if (test.event) {
        it(text + ' when passed an space-separated list', function() {
          this.events.on('event1', this.callback1, this.context1);
          this.events.off('event3 ' + test.event, this[test.callback], this[test.context]);
          this.events.trigger('event1');

          if (test.success) {
            expect(this.callback1).not.to.have.been.called;
          } else {
            expect(this.callback1).to.have.been.called;
          }
        });

        it(text + ' when passed an object', function() {
          this.events.on('event1', this.callback1, this.context1);
          var obj = {}; obj[test.event] = this[test.callback];

          this.events.off(obj, this[test.context]);
          this.events.trigger('event1');

          if (test.success) {
            expect(this.callback1).not.to.have.been.called;
          } else {
            expect(this.callback1).to.have.been.called;
          }
        });
      }
    });
  });

  describe('listenTo', function() {
    it('should return this', function() {
      expect(this.events.listenTo(this.target1)).to.equal(this.events);
    });

    it('should call a callback on an event being fired on another object', function() {
      this.events.listenTo(this.target1, 'myEvent', this.callback1);

      this.target1.trigger('myEvent', 'arg1', 'arg2');
      this.target1.trigger('myEvent', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledTwice
        .and.calledWith('arg1', 'arg2')
        .and.calledWith('arg3', 'arg4');
    });

    it('should call the callback with a default context of the evented object', function() {
      this.events.listenTo(this.target1, 'myEvent', this.callback1);

      this.target1.trigger('myEvent', 'arg1', 'arg2');
      this.target1.trigger('myEvent', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledTwice
        .and.calledWith('arg1', 'arg2')
        .and.calledWith('arg3', 'arg4')
        .and.calledOn(this.events);
    });

    it('should add listeners for multiple events from a space-separated list', function() {
      this.events.listenTo(this.target1, 'myEvent1 myEvent2', this.callback1);

      this.target1.trigger('myEvent1', 'arg1', 'arg2');
      this.target1.trigger('myEvent2', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledTwice
        .and.calledWith('arg1', 'arg2')
        .and.calledWith('arg3', 'arg4')
        .and.always.calledOn(this.events);
    });

    it('should add listener for multiple events from an object', function() {
      this.events.listenTo(this.target1, {
        myEvent1: this.callback1,
        myEvent2: this.callback2
      });

      this.target1.trigger('myEvent1', 'arg1', 'arg2');
      this.target1.trigger('myEvent2', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg2')
        .and.calledOn(this.events);
      expect(this.callback2)
        .to.have.been.calledOnce
        .and.calledWith('arg3', 'arg4')
        .and.calledOn(this.events);
    });

    it('should have keyword "all" for adding listeners to all events', function() {
      this.events.listenTo(this.target1, 'all', this.callback1);

      this.target1.trigger('myEvent1', 'arg1', 'arg2');
      this.target1.trigger('myEvent2', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledTwice
        .and.calledWith('myEvent1', 'arg1', 'arg2')
        .and.calledWith('myEvent2', 'arg3', 'arg4');
    });
  });

  describe('listenToOnce', function() {
    it('should return this', function() {
      expect(this.events.listenToOnce(this.target1)).to.equal(this.events);
    });

    it('should call a callback on an event being fired on another object only once', function() {
      this.events.listenToOnce(this.target1, 'myEvent', this.callback1);

      this.target1.trigger('myEvent', 'arg1', 'arg2');
      this.target1.trigger('myEvent', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg2');
    });

    it('should call the callback with a default context of the evented object only once', function() {
      this.events.listenToOnce(this.target1, 'myEvent', this.callback1);

      this.target1.trigger('myEvent', 'arg1', 'arg2');
      this.target1.trigger('myEvent', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg2')
        .and.calledOn(this.events);
    });

    it('should add listeners for multiple events from a space-separated list', function() {
      this.events.listenToOnce(this.target1, 'myEvent1 myEvent2', this.callback1);

      this.target1.trigger('myEvent1', 'arg1', 'arg2');
      this.target1.trigger('myEvent2', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg2')
        .and.always.calledOn(this.events);
    });

    it('should add listener for multiple events from an object', function() {
      this.events.listenToOnce(this.target1, {
        myEvent1: this.callback1,
        myEvent2: this.callback2
      });

      this.target1.trigger('myEvent1', 'arg1', 'arg2');
      this.target1.trigger('myEvent1', 'arg3', 'arg4');
      this.target1.trigger('myEvent2', 'arg5', 'arg6');
      this.target1.trigger('myEvent2', 'arg7', 'arg8');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('arg1', 'arg2')
        .and.calledOn(this.events);
      expect(this.callback2)
        .to.have.been.calledOnce
        .and.calledWith('arg5', 'arg6')
        .and.calledOn(this.events);
    });

    it('should have keyword "all" for adding listeners to all events', function() {
      this.events.listenToOnce(this.target1, 'all', this.callback1);

      this.target1.trigger('myEvent1', 'arg1', 'arg2');
      this.target1.trigger('myEvent2', 'arg3', 'arg4');

      expect(this.callback1)
        .to.have.been.calledOnce
        .and.calledWith('myEvent1', 'arg1', 'arg2');
    });
  });

  describe('stopListening', function() {
    it('should return this', function() {
      expect(this.events.stopListening()).to.equal(this.events);
    });

    it('should remove all events with no args', function() {
      this.events.listenTo(this.target1, 'myEvent1', this.callback1);
      this.events.listenTo(this.target1, 'myEvent2', this.callback2);

      this.events.stopListening();
      this.target1.trigger('myEvent1');
      this.target1.trigger('myEvent2');

      expect(this.callback1).not.to.have.been.called;
      expect(this.callback2).not.to.have.been.called;
    });

    _.each([
      { target: 'target1', success: true },
      { target: 'target2', success: false },
      { event: 'event1', success: true },
      { event: 'event2', success: false },
      { callback: 'callback1', success: true },
      { callback: 'callback2', success: false },
      { callback: 'callback2', success: false },
      { target: 'target1', callback: 'callback1', success: true },
      { target: 'target1', callback: 'callback2', success: false },
      { target: 'target2', callback: 'callback1', success: false },
      { event: 'event1', target: 'target1', success: true },
      { event: 'event2', target: 'target1', success: false },
      { event: 'event1', target: 'target2', success: false },
      { event: 'event2', callback: 'callback1', success: false },
      { event: 'event1', callback: 'callback2', success: false },
      { target: 'target1', event: 'event1', callback: 'callback1', success: true },
      { target: 'target1', event: 'event2', callback: 'callback1', success: false },
      { target: 'target1', event: 'event1', callback: 'callback2', success: false },
      { target: 'target2', event: 'event1', callback: 'callback1', success: false },
      { target: 'target1', event: 'event2', callback: 'callback2', success: false },
      { target: 'target2', event: 'event2', callback: 'callback1', success: false },
      { target: 'target2', event: 'event1', callback: 'callback2', success: false }
    ], function(test) {
      var text = 'should ' + (test.success ? '' : 'not ') + 'remove an existing event by ';
      var items = [];

      _.each(['target', 'event', 'callback'], function(type) {
        if (test[type]) {
          items.push((test[type] === type + '1' ? 'the same ' : 'a different ') + type);
        }
      });

      text += items.join(', ');

      it(text, function() {
        this.events.listenTo(this.target1, 'event1', this.callback1, this.context1);
        this.events.stopListening(this[test.target], test.event, this[test.callback]);
        this.target1.trigger('event1');

        if (test.success) {
          expect(this.callback1).not.to.have.been.called;
        } else {
          expect(this.callback1).to.have.been.called;
        }
      });

      if (test.event) {
        it(text + ' when passed an space-separated list', function() {
          this.events.listenTo(this.target1, 'event1', this.callback1);
          this.events.stopListening(this[test.target], 'event3 ' + test.event, this[test.callback]);
          this.target1.trigger('event1');

          if (test.success) {
            // console.log(test, text);
            expect(this.callback1).not.to.have.been.called;
          } else {
            expect(this.callback1).to.have.been.called;
          }
        });

        it(text + ' when passed an object', function() {
          this.events.listenTo(this.target1, 'event1', this.callback1);
          var obj = {}; obj[test.event] = this[test.callback];

          this.events.stopListening(this[test.target], obj);
          this.target1.trigger('event1');

          if (test.success) {
            expect(this.callback1).not.to.have.been.called;
          } else {
            expect(this.callback1).to.have.been.called;
          }
        });
      }
    });
  });
});
