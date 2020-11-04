(function (window, document, rJS, jIO, Handlebars) {
  "use strict"
  var handlebars_template = Handlebars.compile(
    document.head.querySelector(".handlebars-template").innerHTML
  );
  var ENTER_KEY = 13;
  var ESCAPE_KEY = 27;
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
    return gadget.getDeclaredGadget("model")
      .push(function (model_gadget) {
         return model_gadget.postTodo(item);
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
  }, false, true)
  .onEvent("click", function (event) {
    var gadget = this,
      todo_item = event.target.parentElement.parentElement,
      jio_id = todo_item.getAttribute("data-jio-id");
    return gadget.getDeclaredGadget("model")
      .push(function (model_gadget) {
        switch (event.target.className) {
        case "toggle":
          return model_gadget.toggleOneTodoStatus(
            jio_id,
            !todo_item.classList.contains("completed")
            );
        case "toggle-all":
          return model_gadget.toggleAllTodoStatus(event.target.checked);
        case "toggle-label":
          return model_gadget.toggleAllTodoStatus(
            !gadget.element.querySelector(".toggle-all").checked
            );
        case "destroy":
          console.log("destroy is triggered");
          return model_gadget.removeOneTodo(jio_id);
        case "clear-completed":
          return model_gadget.removeAllCompletedTodo();
        default:
          if (gadget.state.editing_jio_id
             && event.target.className !== "edit") {
            return "clicking outside of the input box cancels editing";
          }
          return "default";
        }
      })
      .push(function (path) {
        if (path != "default") {
          return gadget.changeState({update:true, editing_jio_id: ""});
        }
      });
  }, false, false)
  .onEvent("dblclick", function (event) {
    var gadget = this;
    if (event.target.className === "todo-label") {
      return gadget.changeState({
        editing_jio_id: event.target.parentElement
          .parentElement.getAttribute("data-jio-id")
      });
    }
  }, false, false)
  .onEvent("keydown", function (event) {
    var gadget = this, item;
    if (event.target.className === "edit") {
      if (event.keyCode === ESCAPE_KEY) {
        return gadget.changeState({update: true, editing_jio_id: ""});
      }
      item = event.target.value.trim();
      if (event.keyCode === ESCAPE_KEY && item) {
        return gadget.getDeclaredGadget("model")
          .push(function (model_gadget) {
            return model_gadget.changeTodoTitle(
              event.target.parentElement.getAttribute("data-jio-id"),
              item
            );
          })
          .push(function () {
            return gadget.changeState({update: true, editing_jio_id: ""});
          });
      }
    }
  }, false, false);

}(window, document, rJS, jIO, Handlebars));

