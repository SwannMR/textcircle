this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

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
        editor.setOption("lineNumbers", true);
        editor.setOption("theme", "monokai");
        editor.on("change", function(cm_editor, info){
          console.log(cm_editor.getValue());
          $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
          Meteor.call("addEditUser");
        });
      }
    }
  });

/*
{
  "_id" : "3TuC7G7hWqRR5Fg5L",
  "docid" : "bN77xmRwQmwQuTEGz",
  "users" : {
    "2o3FNQcQqjG2c2dwF" : {
      "first-name" : "Amy",
      "last-name" : "Who",
      "gender" : "f",
      "country" : "es",
      "lastEdit" : ISODate("2016-02-27T07:30:48.922Z")
    },
*/
  Template.editingUsers.helpers({
    users:function(){
      var doc, eusers, users;
      doc = Documents.findOne();
      if (!doc){return;} //give up
      eusers = EditingUsers.findOne({docid:doc._id});
      if (!eusers){return;} // give up
      users = new Array();
      var i = 0;
      for (var user_id in eusers.users){
        console.log('adding a user');
        users[i] = fixObjectKeys(eusers.users[user_id]);
        i++;
      }
      return users;
    }
  })

} // end is Client block


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    if (!Documents.findOne()){ // no documents yet!
        Documents.insert({title:"my new document"});
    }
  });
}

Meteor.methods({
  addEditUser:function(){
    var doc, user, eusers;
    doc = Documents.findOne();
    if (!doc){return;} // no doc
    if (!this.userId){return;} // no user logged
    user = Meteor.user().profile;
    eusers = EditingUsers.findOne({docid:doc._id});
    if (!eusers){
      eusers = {
        docid:doc._id,
        users:{}
      };
    }
    user.lastEdit = new Date();
    eusers.users[this.userId] = user;
    
    EditingUsers.upsert({_id:eusers._id}, eusers);
  }
});




function fixObjectKeys(obj){
  var newObj = {};
  for (key in obj){
    var key2 = key.replace("-","");
    newObj[key2] = obj[key];
  }
  return newObj;
}