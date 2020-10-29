(function (window, document, rJS, jIO) {
  //octopus.init();
  rJS(window)
  .setState({item_list: [], current_item: null, current_tag: null})
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
          gadget.addItem(item.title);
        });
      });
  })
  .onStateChange(function (modification_dict) {
    console.log("onStageChange is triggered");
    var gadget = this;
    if (modification_dict.hasOwnProperty("current_item")) {
      this.addItem(modification_dict.current_item);
      // what is this doing?? update the model?
      return this.getDeclaredGadget("model")
      .push(function (model_gadget) {
        console.log('updating model');
        // why length is passed?
        // => Since the index of item_list is unique, can be used as ID
        console.log(gadget.state.item_list.length.toString());
        return model_gadget.put(gadget.state.item_list.length.toString(), {
          title: modification_dict.current_item,
          completed: false
        });
      });
    }
  })
  .declareMethod("addItem", function (item) {
    var list_item = document.createElement("LI");
    list_item.appendChild(document.createTextNode(item));
    this.element.querySelector("ul").appendChild(list_item);
    // Can we directory push item here??
    this.state.item_list.push(item);
  })
  .onEvent("click", function (event) {
    console.log('event.target:');
    console.dir(event.target);
    console.log(event.target.tagName);
    return this.changeState({current_tag: event.target.tagName});
  }, false, true)
  .onEvent("submit", function (event) {
    // what is event? form? input?
    // what is index 0 ?
    console.log("submit event is triggered");
    // this gadget variable is needed for changeState
    var gadget = this;
    var item = event.target.elements[0].value;
    event.target.elements[0].value = "";
    // no need to return this??
    return new RSVP.Queue()
    .push(function () {
      console.log('chaning state');
      // we do not need to push item_list here??
      gadget.changeState({current_item: item});
    });
    // what is false, true here??
    // => useCapture, and preventDefault
    // the same with addEventListner()
  }, false, true);

}(window, document, rJS, jIO));

