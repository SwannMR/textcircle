Meteor.methods({

  addComment:function(comment){
    console.log("addComment method");
    if (this.userId){ //Logged in user
      comment.owner = this.userId;
      console.log(comment);
      return Comments.insert(comment);
    }
    else {
      return;
    }
  },
  addDoc:function(){
    var doc;
    if (!this.userId){ //not logged in
      return;
    }
    else {
      console.log('this.userId: ' + this.userId)
      console.log('Meteor.user(): ' + Meteor.user()._id)
//      console.log('this.user(): ' + this.user()._id)
      console.log('Meteor.userId(): ' + Meteor.userId())
      //create Document object for insersion into database
      doc = {owner:this.userId, createdOn: new Date(), title:"my new doc", isPrivate:false};
      var id = Documents.insert(doc);
      console.log("addDoc method: got an id "+id)
      return id
    }
  },
  updateDocPrivacy:function(doc){
    console.log(doc);
    var realDoc = Documents.findOne({_id:doc._id, owner:this.userId});
    if (realDoc){
      realDoc.isPrivate = doc.isPrivate;
      Documents.update({_id:doc._id}, realDoc);
    }
  },
  addEditUser:function(docid){
    var doc, user, eusers;
    doc = Documents.findOne({_id:docid});
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
