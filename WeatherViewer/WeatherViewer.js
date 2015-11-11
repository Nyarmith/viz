if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);

      Meteor.call('callPython');
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {

var exec = Npm.require('child_process').exec;
var Fiber = Npm.require('fibers');
var Future = Npm.require('fibers/future');

Meteor.methods({

  callPython: function() {
    var fut = new Future();

    var options = {
    mode: 'text',
    scriptPath: '/Users/Amar/Desktop/Programming/WebDev/viz/wolfram-scripts/test.py',
    //args: [json1]
    };

    //var PythonShell = require('python-shell');
    //PythonShell.run('test.py', options, function (err, results) { 

    // Path = ../wolfram-scripts/fetcher < data
    //exec('data=0 && echo $data | ../wolfram-scripts/fetcher.py', function (error, stdout, stderr) {
    exec('python /Users/Amar/Desktop/Programming/WebDev/viz/wolfram-scripts/test.py', function(error, stdout, stderr) {
      console.log("hi");
      //console.log(error);
      console.log("stout: " + stdout);
      //console.log(stderr);

      var jso = stdout;


      // if you want to write to Mongo in this callback
      // you need to get yourself a Fiber
      new Fiber(function() {
        //...
        fut.return('Python was here');
      }).run();

    });
    return fut.wait();
  },

});


  });
}
