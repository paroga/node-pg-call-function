var expect = require('chai').expect;
var pgCallFunction = require('../index');
var sinon = require('sinon');

describe('node-pg-call-function', function() {

  describe('.extend()', function() {

    it('adds callFunction to Client', function() {
      var pg = {
        Client: function() {
        }
      };

      pgCallFunction.extend(pg);
      expect(pg.Client).to.respondTo('callFunction');
    });

  });

  describe('.callFunction()', function() {

    var client = null;

    beforeEach(function() {
      var queryStub = sinon.stub();

      client = {
        callFunction: pgCallFunction,
        query: queryStub
      };
    });

    afterEach(function() {
      expect(client.query.callCount).to.equal(1);
      expect(client.query.firstCall.thisValue).to.equal(client);
    });

    it('handles no parameters', function(done) {
      client.query.callsArgWith(2, null, {
        fields: [],
        rows: [{}]
      });

      client.callFunction('funName', [], function(err) {
        expect(err).to.be.null;

        var args = client.query.firstCall.args;
        expect(args[0].text).to.equal('SELECT*FROM funName()');
        expect(args[1]).to.eql([]);

        done();
      });
    });

    it('handles one in parameter', function(done) {
      client.query.callsArgWith(2, null, {
        fields: [],
        rows: [{}]
      });

      client.callFunction('funName', ['p1'], function(err) {
        expect(err).to.be.null;

        var args = client.query.firstCall.args;
        expect(args[0].text).to.equal('SELECT*FROM funName($1)');
        expect(args[1]).to.eql(['p1']);

        done();
      });
    });

    it('handles two in parameter', function(done) {
      client.query.callsArgWith(2, null, {
        fields: [],
        rows: [{}]
      });

      client.callFunction('funName', ['p1', 2], function(err) {
        expect(err).to.be.null;

        var args = client.query.firstCall.args;
        expect(args[0].text).to.equal('SELECT*FROM funName($1,$2)');
        expect(args[1]).to.eql(['p1', 2]);

        done();
      });
    });

    it('handles one out parameter', function(done) {
      client.query.callsArgWith(2, null, {
        fields: [{
          name: 'testCol'
        }],
        rows: [{
          testCol: 'testColValue'
        }]
      });

      client.callFunction('funName', [], function(err, testCol) {
        expect(err).to.be.null;
        expect(testCol).to.equal('testColValue');
        done();
      });
    });

    it('handles three out parameter', function(done) {
      client.query.callsArgWith(2, null, {
        fields: [{
          name: 'testColA'
        },{
          name: 'testColB'
        },{
          name: 'testColC'
        }],
        rows: [{
          testColA: 'aa',
          testColB: 1234,
          testColC: true
        }]
      });

      client.callFunction('funName', [], function(err, a, b, c) {
        expect(err).to.be.null;
        expect(a).to.equal('aa');
        expect(b).to.equal(1234);
        expect(c).to.equal(true);
        done();
      });
    });

    it('handles in and out parameter', function(done) {
      client.query.callsArgWith(2, null, {
        fields: [{
          name: 'aa'
        },{
          name: 'bb'
        }],
        rows: [{
          aa: 123,
          bb: 789
        }]
      });

      client.callFunction('funName', [12, 34, 'p3'], function(err, aa, bb) {
        expect(err).to.be.null;
        expect(aa).to.equal(123);
        expect(bb).to.equal(789);

        var args = client.query.firstCall.args;
        expect(args[0].text).to.equal('SELECT*FROM funName($1,$2,$3)');
        expect(args[1]).to.eql([12, 34, 'p3']);

        done();
      });
    });

    it('returns error', function(done) {
      client.query.callsArgWith(2, 'queryError');

      client.callFunction('funName', [], function(err) {
        expect(err).to.equal('queryError');
        done();
      });
    });

    it('support config object', function(done) {
      client.query.callsArgWith(2, null, {
        fields: [],
        rows: [{}]
      });

      var config = {
        binary: true,
        'function': 'foobar'
      };
      client.callFunction(config, [], function(err) {
        expect(err).to.be.null;

        var args = client.query.firstCall.args;
        expect(args[0].text).to.equal('SELECT*FROM foobar()');
        expect(args[1]).to.eql([]);

        done();
      });
    });

  });

});
