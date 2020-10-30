(function (window, rJS, jIO) {
  //octopus.init();
  rJS(window)
  .setState({item_list: [], update: false})
  .declareService(function () {
    var model_gadget;
    var gadget = this;
    return this.getDeclaredGadget("model")
      .push(function (subgadget) {
        console.log("model gadget as sub gadget");
        model_gadget = subgadget;
        return model_gadget.put("/", {title: "Test", completed: false });
       })
      .push(function () {
        return model_gadget.allDocs();
      })
      .push(function (result_list) {
        var promise_list = [];
        // result_list is a Promise Queue which has data property
        // Why do we need to create promise_list here???
        // It seems almost useless here.
        result_list.data.rows.map(function (row) {
          // model_gadget.get returns a promise??
          //console.log(model_gadget.get(row.id));
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
          console.log('item.title:' + item.title);
          //gadget.addItem(item.title);
          // directory put into state???
          gadget.state.item_list.push(item.title);
        });
        return gadget.changeState({update: true});
      });
  })
  .onStateChange(function (modification_dict) {
    // what should we do in onStateChage???
    console.log("onStageChange is triggered");
    var gadget = this;
    console.log('modification_dict:');
    console.log(modification_dict);
    this.element.querySelector("ul").innerHTML =
      "<li>" + this.state.item_list.join("</li>\n<li>") + "</li>";
    // We can not changeState({update: false}) here.
    // since it will loop infinitely
    this.state.update = false;
  })
  .declareMethod("addItem", function (item) {
    var gadget = this;
    // Can we directory push item here??
    // Some properties are updated through changeState() and item_list are
    // directory write into state ???
    gadget.state.item_list.push(item);
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
    return this.addItem(item);
    // what is false, true here??
    // => useCapture, and preventDefault
    // the same with addEventListner()
  }, false, true);

}(window, rJS, jIO));

