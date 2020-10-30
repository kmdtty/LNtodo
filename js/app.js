(function (window, document, rJS, jIO, Handlebars) {
  "use strict"
  var handlebars_template = Handlebars.compile(
    document.head.querySelector(".handlebars-template").innerHTML
  );
  rJS(window)
  .setState({update: false})
  .declareService(function () {
    return this.changeState({update: true});
  })
  .onStateChange(function (modification_dict) {
    // what should we do in onStateChage???
    var gadget = this;
    // We can not changeState({update: false}) here.
    // since it will loop infinitely
    return this.getDeclaredGadget("model")
      .push(function (model_gadget) {
        return model_gadget.getTodoList();
      })
      .push(function (todo_list) {
        var plural = todo_list.length === 1 ? " item" : " items";
        gadget.element.querySelector(".handlebars-anchor").innerHTML =
          handlebars_template({
            todo_list: todo_list,
            todo_exists: todo_list.length > 0,
            //todo_count: todo_list.length.toString() + plural,
            all_completed: false
          });
        gadget.state.update = false;
      });
  })
  .declareMethod("addItem", function (item) {
    var gadget = this;
    var model_gadget = undefined;
    return gadget.getDeclaredGadget("model")
      .push(function (sub_gadget) {
        model_gadget = sub_gadget;
        return model_gadget.getTodoList();
      })
      .push(function (todo_list) {
        return model_gadget.putTodo(todo_list.length.toString(),
          {title: item, complete: false});
      })
      .push(function () {
        return gadget.changeState({update: true});
      });
  })
  .onEvent("submit", function (event) {
    // what is event? form? input?
    // what is index 0 ?
    var item = event.target.elements[0].value;
    event.target.elements[0].value = "";
    if (item) {
      return this.addItem(item);
    }
    // what is false, true here??
    // => useCapture, and preventDefault
    // the same with addEventListner()
  }, false, true);

}(window, document, rJS, jIO, Handlebars));

