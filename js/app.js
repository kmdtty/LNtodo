(function (window, document, rJS, jIO) {
    var model = {
      init: function() {
        var storage = jIO.createJIO({"type": "indexeddb", "database": "foo"});
        console.log(storage);
        console.dir(storage.allDocs());
        console.log('alldocs:' + storage.allDocs());
        function foo(message) {
          return storage.put("start", message)
          .push(function (result) {
              console.log('1st:' + result);
              return storage.get("start");
          })
          .push(function (result) {
              console.log('storage.get("start"):' + result);
          }, function (error) {
              console.warn(error);
              throw error;
          });
        }
        return foo("hello");
      },
    }

    var octopus = {
      init: function() {
         model.init();
      }
    }
    //octopus.init();
    rJS(window)
    .setState({item_list: [], current_item: null})
    .declareService(function () {
      var model_gadget;
      return this.getDeclaredGadget("model")
        .push(function (subgadget) {
          console.log("model gadget as sub gadget");
          model_gadget = subgadget;
          return model_gadget.put("/", {title: "Test", completed: false });
         });
    })
    .onStateChange(function (modification_dict) {
      console.log("onStageChange is triggered");
      if (modification_dict.hasOwnProperty("current_item")) {
        this.addItem(modification_dict.current_item);
        console.dir(modification_dict);
        // what is this doing?? update the model?
        return this.getDeclaredGadget("model")
        .push(function (model_gadget) {
          // why length is passed?
          // => Since the index of item_list is unique, can be used as ID
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
    })
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
        gadget.changeState({current_item: item});
      });
      // what is false, true here??
      // => useCapture, and preventDefault
      // the same with addEventListner()
    }, false, true);

}(window, document, rJS, jIO));

