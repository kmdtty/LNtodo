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
    .declareService(function () {
    });
}(window, document, rJS, jIO));

