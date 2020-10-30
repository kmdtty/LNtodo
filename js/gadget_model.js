/*jslint nomem: true, indent: 2, maxerr: 3, maxlen:80*/
/*global window, RSVP, rJS, jIO*/
(function (window, RSVP, rJS, jIO) {
  "use strict";
  rJS(window)
  .declareService(function () {
    console.log("Hello, world");
  })
  .ready(function () {
    // when is this called??
    console.log("gadget_model.js changeState is called");
    // what this changeState() actually do?
    var gadget = this;
    return new RSVP.Queue()
      /*.push(function () {
        // this just demonstrate delay and ready()
        return RSVP.delay(1500);
      })*/
      .push(function () {
        // changeState() in this model is called only once.
        // Is this because there is no view in this gadget?
        return gadget.changeState(
          {storage: jIO.createJIO({type: "indexeddb", database: "todo"}) });
       });
  })
  .declareMethod("put", function () {
    // changeStage modifies this.state which is a dictionary
    // this.state['storage'] is a jIO instance
    // what is apply?? why don't we call put(storage, arguments)?
    // apply(this, args) makes a closure?? arguments are fixed when call
    // the function??
    // XXX: storage is passed to apply in the tutorial, not this.state.storage
    return this.state.storage.put.apply(this.state.storage, arguments);
  })
  .declareMethod("get", function () {
    return this.state.storage.get.apply(this.state.storage, arguments);
  })
  .declareMethod("allDocs", function () {
    return this.state.storage.allDocs.apply(this.state.storage, arguments);
  });
}(window, RSVP, rJS, jIO));
