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
  })
  .declareMethod("getTodoList", function () {
    var gadget = this;
    return this.state.storage.allDocs()
      .push(function (result_list) {
        var promise_list = [];
        result_list.data.rows.map(function (row) {
          promise_list.push(gadget.state.storage.get(row.id));
        });
        // we need to use RSVP.all since jIO returns promise
        // not a real array. Are there any good way if there is
        // one promise? RSVP.resolve()? or just promise.push()?
        // or always use RSVP.all()?
        // => Use promise.push() or RSVP.all() in my understanding
        return RSVP.all(promise_list);
      });
  })
  .declareMethod("putTodo", function (id, todo) {
    var gadget = this;
    return this.state.storage.get(id)
      .push(function (result) {
        todo.map(function (key) {
          if (todo.hasOwnProperty(key)) {
            result[key] = todo[key];
          }
        });
        return result;
      }, function () {
        // reject callback
        return todo;
      })
      .push(function (todo) {
        return gadget.state.storage.put(id, todo)
      });
  });
}(window, RSVP, rJS, jIO));
