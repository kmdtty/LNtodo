(function (window, document, rJS, jIO, Handlebars) {
  "use strict"
  var handlebars_template = Handlebars.compile(
    document.head.querySelector(".handlebars-template").innerHTML
  );
  //octopus.init();
  rJS(window)
  .setState({item_list: [], update: false})
  .declareService(function () {
    var model_gadget;
    var gadget = this;
    return this.getDeclaredGadget("model")
      .push(function (gadget) {
        model_gadget = gadget;
        return model_gadget.allDocs();
      })
      .push(function (result_list) {
        var promise_list = [];
        // result_list is a Promise Queue which has data property
        // Why do we need to create promise_list here???
        // It seems almost useless here.
        result_list.data.rows.map(function (row) {
          // model_gadget.get returns a promise??
          // This get() is jIO.get so returns a Promise
          promise_list.push(model_gadget.get(row.id));
        });
        // without RSVP.all, we can not immediately get an array
        return RSVP.all(promise_list);
      })
      .push(function (result_list) {
        console.log('result_list:')
        console.dir(result_list)
        result_list.map(function (item) {
          // directory put into state???
          gadget.state.item_list.push(item);
        });
        return gadget.changeState({update: true});
      });
  })
  .onStateChange(function (modification_dict) {
    // what should we do in onStateChage???
    var gadget = this;
    //this.element.querySelector("ul").innerHTML =
    //  "<li>" + this.state.item_list.join("</li>\n<li>") + "</li>";
    // We can not changeState({update: false}) here.
    // since it will loop infinitely
    var plural = this.state.item_list.length === 1 ? " item" : "items";
    this.element.querySelector(".handlebars-anchor").innerHTML =
      handlebars_template({
        todo_list: this.state.item_list,
        todo_exists: this.state.item_list.length > 0,
        todo_count: this.state.item_list.length.toString() + plural,
        all_completed: false
      });
    this.state.update = false;
    //this.element.querySelector(".todo-count").textContent =
    //  this.state.item_list.length + " items";
  })
  .declareMethod("addItem", function (item) {
    var gadget = this;
    // Can we directory push item here??
    // Some properties are updated through changeState() and item_list are
    // directory write into state ???
    // If so, what for change state? just notify the modification to render??
    gadget.state.item_list.push({title: item, completed: false});
    return gadget.getDeclaredGadget("model")
      .push(function (model_gadget) {
        // why length is passed?
        // => Since the index of item_list is unique, can be used as ID
        return model_gadget.put(gadget.state.item_list.length.toString(),
          {title: item, completed: false});
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

