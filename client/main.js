Meteor.subscribe("documents");
console.log(Documents.find().fetch());
Meteor.subscribe("editingUsers");
Meteor.subscribe("comments");

///////////////
/// Routing ///
///////////////

Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function() {
  console.log("you hit /");
  this.render("navbar", {to:"header"});
  this.render("docList", {to:"main"});
});

Router.route('/documents/:_id', function() {
  console.log("you hit /documents " + this.params._id);
  Session.set("docid", this.params._id)
  this.render("navbar", {to:"header"});
  this.render("docItem", {to:"main"});
});


///////////////
/// Helpers ///
///////////////

Template.editor.helpers({
  docid:function(){
    setupCurrentDocument();
    return Session.get("docid");
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
        console.log("DocID: " + Session.get("docid"));
        Meteor.call("addEditUser", Session.get("docid"));
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
    doc = Documents.findOne({_id:Session.get("docid")});
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

Template.navbar.helpers({
  documents:function(){
    return Documents.find();
  }
})

Template.docMeta.helpers({
  document:function(){
    return Documents.findOne({_id:Session.get("docid")});
  },
  canEdit:function(){
    var doc;
    doc = Documents.findOne({_id:Session.get("docid")});
    if (doc){
      if (doc.owner == Meteor.userId()){
        return true;
      }
    }
    return false;
  }
})

Template.editableText.helpers({
  userCanEdit:function(doc, Collection){
    // can edit if current doc is owned by me
    doc = Documents.findOne({_id:Session.get("docid"), owner:Meteor.userId()});
    if (doc) {
      return true;
    }
    else {
      return false
    }
  }
})

Template.docList.helpers({
  documents:function(){
    return Documents.find();
  }
})

Template.insertCommentForm.helpers({
  docid:function(){
    return Session.get("docid");
  }
})

Template.commentList.helpers({
  comments:function(){
    return Comments.find({docid:Session.get("docid")});
  }
});

//////////////////
//// Events  /////
//////////////////

Template.navbar.events({
  "click .js-add-doc":function(event){
    event.preventDefault();
    console.log("Add a new doc!");
    if ( !Meteor.user()){
      alert("You need to login first");
    }
    else {
      // they are logged in... lets insert doc
     var id = Meteor.call("addDoc", function(err, result){
      if (!err){//all good
        console.log("event callback received id: " + id);   //asynchronous coding
        Session.set("docid", result);
      }
     });
    }
  },
  "click .js-load-doc":function(event){
    console.log(this);
    Session.set("docid", this._id);
  }
})

Template.docMeta.events({
  "click .js-tog-private":function(event){
    console.log(event.target.checked); //true or false
    var doc = {_id:Session.get("docid"), isPrivate:event.target.checked};
    Meteor.call("updateDocPrivacy", doc);

  }
})

function fixObjectKeys(obj){
  var newObj = {};
  for (key in obj){
    var key2 = key.replace("-","");
    newObj[key2] = obj[key];
  }
  return newObj;
}

// Storing docid 
function setupCurrentDocument(){
  var doc;
  if (!Session.get("docid")){
    doc = Documents.findOne();
    if (doc){
      Session.set("docid",doc._id);
    }
  }
}
