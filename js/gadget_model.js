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
          {storage: jIO.createJIO({type: "uuid", 
                                   sub_storage: {
                                    type: "document",
                                    document_id: "/",
                                    sub_storage: {type: "local"} }
                                  })
          });
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
          var promise = gadget.state.storage.get(row.id);
          var promise_extended = promise.push(function (r) {
            r['id'] = row.id;
            return r;
          });
          promise_list.push(promise_extended);
        });
        // we need to use RSVP.all since jIO returns promise
        // not a real array. Are there any good way if there is
        // one promise? RSVP.resolve()? or just promise.push()?
        // or always use RSVP.all()?
        // => Use promise.push() or RSVP.all() in my understanding
        return RSVP.all(promise_list);
      });
  })
  .declareMethod("postTodo", function (title) {
    var gadget = this;
    return gadget.state.storage.post({
      title: title,
      completed: false
    });
  })
  .declareMethod("putTodo", function (id, todo) {
    var gadget = this;
    return this.state.storage.get(id)
      .push(function (result) {
        Object.keys(todo).map(function (key) {
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
  })
  .declareMethod("changeTodoTitle", function (id, title) {
    var gadget = this;
    return gadget.putTodo(id, {title: title});
  })
  .declareMethod("toggleOneTodoStatus", function (id, completed) {
    var gadget = this;
    return gadget.putTodo(id, {completed: completed});
  })
  .declareMethod("toggleAllTodoStatus", function (completed) {
    var gadget = this;
    return gadget.state.storage.allDocs()
      .push(function (result_list) {
        var promise_list = [];
        result_list.data.rows.map(function (row) {
          promise_list.push(gadget.toggleOneTodoStatus(row.id, completed));
        })
        return RSVP.all(promise_list);
      });
  })
  .declareMethod("removeOneTodo", function (id) {
    var gadget = this;
    return gadget.state.storage.remove(id);
  })
  .declareMethod("removeAllCompletedTodo", function () {
    var gadget = this;
    return gadget.getTodoList()
      .push(function (todo_list) {
        var promise_list = [];
        todo_list.map(function (todo) {
          if (todo.completed) {
            promise_list.push(gadget.removeOneTodo(todo.id));
          }
        });
        return RSVP.all(promise_list);
      })
  });
}(window, RSVP, rJS, jIO));
