this.Documents = new Mongo.Collection("documents");

if (Meteor.isClient) {

  Template.editor.helpers({
    docid:function(){
      console.log(Documents.findOne())
      var doc = Documents.findOne();
      if (doc){
        return doc._id;
      }
      else {
        return undefined
      }
    },
    // Define a configuration function for editor. This will be call when 
    // editor is instanciated. Config function event listener. Whenever 
    // editor is changed print it out
    config:function(){
      return function(editor){ 
        // event listener for change and render on preview
        editor.on("change", function(cm_editor, info){
          console.log(cm_editor.getValue());
          $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
        });
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    if (!Documents.findOne()){ // no documents yet!
        Documents.insert({title:"my new document"});
    }
  });
}
