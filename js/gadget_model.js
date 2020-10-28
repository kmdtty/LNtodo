/*jslint nomem: true, indent: 2, maxerr: 3, maxlen:80*/
/*global window, RSVP, rJS, jIO*/
(function (window, RSVP, rJS, jIO) {
  rJS(window)
  .declareService(function () {
    console.log("Hello, world");
  })
  .declareService(function () {
    // when is this called??
    console.log("gadget_model.js changeState is called");
    return this.changeState(
      {storage: jIO.createJIO({type: "indexeddb", database: "todo"})});
  })
  .declareMethod("put", function () {
    // changeStage modifies this.state which is a dictionary
    // this.state['storage'] is a jIO instance
    // what is apply?? why don't we call put(storage, arguments)?
    // apply(this, args) makes a closure?? arguments are fixed when call
    // the function??
    return this.state.storage.put.apply(storage, arguments);
  })
  .declareMethod("get", function () {
    return this.state.storage.get.apply(storage, arguments);
  })
  .declareMethod("allDocs", function () {
    return this.state.storage.allDocs.apply(storage, arguments);
  });
}(window, RSVP, rJS, jIO));
