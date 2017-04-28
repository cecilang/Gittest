var mongoose = require('mongoose');

//create doc schema
var docSchema = mongoose.Schema({ //define schema props
  Object1: {
    type: String,
    required: true //for validation
  },
  Object2: {
    type: String,
    required: true //for validation
  },
  Dissimdist: {
    type: Number
  },
  Relationship: {
    type: String
  },
  Traffic: {
    Competitor: {
      User: [{
        userid: {type: String, ref: 'User'},
        vote_type: {type: Number},
        vote_count: {type: Number},
        vote_date: {type: Date, default: Date.now},
        user_comment: {type: String}
      }]
    },
    Supplier: {
      User: [{
        userid: {type: String, ref: 'User'},
        vote_type: {type: Number},
        vote_count: {type: Number},
        vote_date: {type: Date, default: Date.now},
        user_comment: {type: String}
      }]
    },
    Client: {
      User: [{
        userid: {type: String, ref: 'User'},
        vote_type: {type: Number},
        vote_count: {type: Number},
        vote_date: {type: Date, default: Date.now},
        user_comment: {type: String}
      }]
    },
    Sister: {
      User: [{
        userid: {type: String, ref: 'User'},
        vote_type: {type: Number},
        vote_count: {type: Number},
        vote_date: {type: Date, default: Date.now},
        user_comment: {type: String}
      }]
    },
    Subsidiary: {
      User: [{
        userid: {type: String, ref: 'User'},
        vote_type: {type: Number},
        vote_count: {type: Number},
        vote_date: {type: Date, default: Date.now},
        user_comment: {type: String}
      }]
    },
    Parent: {
      User: [{
        userid: {type: String, ref: 'User'},
        vote_type: {type: Number},
        vote_count: {type: Number},
        vote_date: {type: Date, default: Date.now},
        user_comment: {type: String}
      }]
    },
  },
  News: {
    Headlines: [{type: String}],
    Dates: [{type: Date}],
    Abstracts: [{type: String}]
  },
  create_date: {
    type: Date,
    default: Date.now
  }
});

var Doc = module.exports = mongoose.model('Doc', docSchema); //make copy of schema and export to outside

//get docs
module.exports.getDocs = function(callback, limit){ //set up getDocs as a function for export
  Doc.aggregate({
    $project: {
      _id:0,
      Object1:1,
      Object2:1,
      Dissimdist:1,
      Relationship:1,
    }
  })
    .sort({ DissimDist:1 })
    .exec(callback);
};

//get doc by object1
module.exports.getDocsByObject1 = function(id, callback){ //no limit cos there's only one object parsed, and use singular term for object
  var object1 = {
    Object1: id,
    Dissimdist: { $lte: .75 },
    Relationship: {$ne: "peer"}
  };

  Doc.aggregate(
    {$match: object1},
    {$sort: { DissimDist:1 }},
    {$project: {
      _id:0,
      Object1:1,
      Object2:1,
      Dissimdist:1,
      Relationship:1,
      netCompetitor: {$sum: "$Traffic.Competitor.User.vote_type"},
      netSupplier: {$sum: "$Traffic.Supplier.User.vote_type"},
      netClient: {$sum: "$Traffic.Client.User.vote_type"},
      netSister: {$sum: "$Traffic.Sister.User.vote_type"},
      netSubsidiary: {$sum: "$Traffic.Subsidiary.User.vote_type"},
      netParent: {$sum: "$Traffic.Parent.User.vote_type"},
      totalCompetitor: {$sum:
        "$Traffic.Competitor.User.vote_count"},
      totalSupplier: {$sum:
        "$Traffic.Supplier.User.vote_count"},
      totalClient: {$sum:
        "$Traffic.Client.User.vote_count"},
      totalSister: {$sum:
        "$Traffic.Sister.User.vote_count"},
      totalSubsidiary: {$sum:
        "$Traffic.Subsidiary.User.vote_count"},
      totalParent: {$sum:
        "$Traffic.Parent.User.vote_count"}
    }},
    {$project: {
      _id:0,
      source:"$Object1",
      target:"$Object2",
      value: {$cond: {
        if: {
          $ne: [{$sum: [
            "$totalCompetitor", "$totalSupplier", "$totalClient", "$totalSister", "$totalSubsidiary", "$totalParent"
          ]} ,0]
        },
        then: {
          $multiply: [
            {$divide: [5, "$Dissimdist"]},
            {$sum: [
              "$totalCompetitor", "$totalSupplier", "$totalClient", "$totalSister", "$totalSubsidiary", "$totalParent"
            ]}
          ]},
        else: "$Dissimdist"
      }},
      totalVotes: {$sum: [
        "$totalCompetitor", "$totalSupplier", "$totalClient", "$totalSister", "$totalSubsidiary", "$totalParent"
      ]},
      relationship: {$cond: {
        if: {
          $gte: [{$sum: [
            "$totalCompetitor", "$totalSupplier", "$totalClient", "$totalSister", "$totalSubsidiary", "$totalParent"
          ]} , 30]
        },
        then: {
          Competitor: "$netCompetitor",
          Supplier: "$netSupplier",
          Client: "$netClient",
          Sister: "$netSister",
          Subsidiary: "$netSubsidiary",
          Parent: "$netParent"
        },
        else: "$Relationship"
      }}
    }}
  )
    .exec(callback);
};

//get doc by object2
module.exports.getDocsByObject2 = function(id, callback){ //no limit cos there's only one object parsed, and use singular term for object
  var object2 = {
    Object2: id,
    Dissimdist: { $lte: .75 },
    Relationship: {$ne: "peer"}
  };

  Doc.aggregate(
    {$match: object2},
    {$sort: { DissimDist:1 }},
    {$project: {
      _id:0,
      Object1:1,
      Object2:1,
      Dissimdist:1,
      Relationship:1,
      netCompetitor: {$sum: "$Traffic.Competitor.User.vote_type"},
      netSupplier: {$sum: "$Traffic.Supplier.User.vote_type"},
      netClient: {$sum: "$Traffic.Client.User.vote_type"},
      netSister: {$sum: "$Traffic.Sister.User.vote_type"},
      netSubsidiary: {$sum: "$Traffic.Subsidiary.User.vote_type"},
      netParent: {$sum: "$Traffic.Parent.User.vote_type"},
      totalCompetitor: {$sum:
        "$Traffic.Competitor.User.vote_count"},
      totalSupplier: {$sum:
        "$Traffic.Supplier.User.vote_count"},
      totalClient: {$sum:
        "$Traffic.Client.User.vote_count"},
      totalSister: {$sum:
        "$Traffic.Sister.User.vote_count"},
      totalSubsidiary: {$sum:
        "$Traffic.Subsidiary.User.vote_count"},
      totalParent: {$sum:
        "$Traffic.Parent.User.vote_count"}
    }},
    {$project: {
      _id:0,
      source:"$Object2",
      target:"$Object1",
      value: {$cond: {
        if: {
          $ne: [{$sum: [
            "$totalCompetitor", "$totalSupplier", "$totalClient", "$totalSister", "$totalSubsidiary", "$totalParent"
          ]} ,0]
        },
        then: {
          $multiply: [
            {$divide: [5, "$Dissimdist"]},
            {$sum: [
              "$totalCompetitor", "$totalSupplier", "$totalClient", "$totalSister", "$totalSubsidiary", "$totalParent"
            ]}
        ]},
        else: "$Dissimdist"
      }},
      totalVotes: {$sum: [
        "$totalCompetitor", "$totalSupplier", "$totalClient", "$totalSister", "$totalSubsidiary", "$totalParent"
      ]},
      relationship: {$cond: {
        if: {
          $gte: [{$sum: [
            "$totalCompetitor", "$totalSupplier", "$totalClient", "$totalSister", "$totalSubsidiary", "$totalParent"
          ]} , 30]
        },
        then: {
          Competitor: "$netCompetitor",
          Supplier: "$netSupplier",
          Client: "$netClient",
          Sister: "$netSister",
          Subsidiary: "$netSubsidiary",
          Parent: "$netParent"
        },
        else: "$Relationship"
      }}
    }}
  )
    .exec(callback);
};

//create target array by object1
module.exports.getTargetsByObject1 = function(id, callback){ //no limit cos there's only one object parsed, and use singular term for object
  var object1 = {
    Object1: id,
    Dissimdist: { $lte: .75 },
    Relationship: {$ne: "peer"}
  };

  Doc.aggregate(
    {$match: object1},
    {$sort: { DissimDist:1 }},
    {$group: {_id:0, targets: { $push: "$Object2"}}},
    {$unwind: "$targets"},
    {$project: {_id:0, targets:1}}
  )
    .exec(callback);
};

//get targets only by object2
module.exports.getTargetsByObject2 = function(id, callback){ //no limit cos there's only one object parsed, and use singular term for object
  var object2 = {
    Object2: id,
    Dissimdist: { $lte: .75 },
    Relationship: {$ne: "peer"}
  };

  Doc.aggregate(
    {$match: object2},
    {$sort: { DissimDist:1 }},
    {$group: {_id:0, targets: { $push: "$Object1"}}},
    {$unwind: "$targets"},
    {$project: {_id:0, targets:1}}
  )
    .exec(callback);
};

//upvote Competitor
module.exports.upvoteCompetitor = function(source, target, userid, comment, options, callback){
  var query = {Object1: source, Object2: target};
  var update = {
    $push: {"Traffic.Competitor.User": {
      userid: userid,
      vote_type: 1,
      vote_count: 1,
      $currentDate: {vote_date: true},
      user_comment: comment
    }}
  };
  Doc.findOneAndUpdate(query, update, options, callback);
};

//downvote Competitor
module.exports.downvoteCompetitor = function(source, target, userid, comment, options, callback){
  var query = {Object1: source, Object2: target};
  var update = {
    $push: {"Traffic.Competitor.User": {
      userid: userid,
      vote_type: -1,
      vote_count: 1,
      $currentDate: {vote_date: true},
      user_comment: comment
    }}
  };
  Doc.findOneAndUpdate(query, update, options, callback);
};

//upvote Supplier
module.exports.upvoteSupplier = function(source, target, userid, comment, options, callback){
  var query = {Object1: source, Object2: target};
  var update = {
    $push: {"Traffic.Supplier.User": {
      userid: userid,
      vote_type: 1,
      vote_count: 1,
      $currentDate: {vote_date: true},
      user_comment: comment
    }}
  };
  Doc.findOneAndUpdate(query, update, options, callback);
};

//downvote Supplier
module.exports.downvoteSupplier = function(source, target, userid, comment, options, callback){
  var query = {Object1: source, Object2: target};
  var update = {
    $push: {"Traffic.Supplier.User": {
      userid: userid,
      vote_type: -1,
      vote_count: 1,
      $currentDate: {vote_date: true},
      user_comment: comment
    }}
  };
  Doc.findOneAndUpdate(query, update, options, callback);
};

//upvote Client
module.exports.upvoteClient = function(source, target, userid, comment, options, callback){
  var query = {Object1: source, Object2: target};
  var update = {
    $push: {"Traffic.Client.User": {
      userid: userid,
      vote_type: 1,
      vote_count: 1,
      $currentDate: {vote_date: true},
      user_comment: comment
    }}
  };
  Doc.findOneAndUpdate(query, update, options, callback);
};

//downvote Client
module.exports.downvoteClient = function(source, target, userid, comment, options, callback){
  var query = {Object1: source, Object2: target};
  var update = {
    $push: {"Traffic.Client.User": {
      userid: userid,
      vote_type: -1,
      vote_count: 1,
      $currentDate: {vote_date: true},
      user_comment: comment
    }}
  };
  Doc.findOneAndUpdate(query, update, options, callback);
};

//upvote Sister
module.exports.upvoteSister = function(source, target, userid, comment, options, callback){
  var query = {Object1: source, Object2: target};
  var update = {
    $push: {"Traffic.Sister.User": {
      userid: userid,
      vote_type: 1,
      vote_count: 1,
      $currentDate: {vote_date: true},
      user_comment: comment
    }}
  };
  Doc.findOneAndUpdate(query, update, options, callback);
};

//downvote Sister
module.exports.downvoteSister = function(source, target, userid, comment, options, callback){
  var query = {Object1: source, Object2: target};
  var update = {
    $push: {"Traffic.Sister.User": {
      userid: userid,
      vote_type: -1,
      vote_count: 1,
      $currentDate: {vote_date: true},
      user_comment: comment
    }}
  };
  Doc.findOneAndUpdate(query, update, options, callback);
};

//upvote Subsidiary
module.exports.upvoteSubsidiary = function(source, target, userid, comment, options, callback){
  var query = {Object1: source, Object2: target};
  var update = {
    $push: {"Traffic.Subsidiary.User": {
      userid: userid,
      vote_type: 1,
      vote_count: 1,
      $currentDate: {vote_date: true},
      user_comment: comment
    }}
  };
  Doc.findOneAndUpdate(query, update, options, callback);
};

//downvote Subsidiary
module.exports.downvoteSubsidiary = function(source, target, userid, comment, options, callback){
  var query = {Object1: source, Object2: target};
  var update = {
    $push: {"Traffic.Subsidiary.User": {
      userid: userid,
      vote_type: -1,
      vote_count: 1,
      $currentDate: {vote_date: true},
      user_comment: comment
    }}
  };
  Doc.findOneAndUpdate(query, update, options, callback);
};

//upvote Parent
module.exports.upvoteParent = function(source, target, userid, comment, options, callback){
  var query = {Object1: source, Object2: target};
  var update = {
    $push: {"Traffic.Parent.User": {
      userid: userid,
      vote_type: 1,
      vote_count: 1,
      $currentDate: {vote_date: true},
      user_comment: comment
    }}
  };
  Doc.findOneAndUpdate(query, update, options, callback);
};

//downvote Parent
module.exports.downvoteParent = function(source, target, userid, comment, options, callback){
  var query = {Object1: source, Object2: target};
  var update = {
    $push: {"Traffic.Parent.User": {
      userid: userid,
      vote_type: -1,
      vote_count: 1,
      $currentDate: {vote_date: true},
      user_comment: comment
    }}
  };
  Doc.findOneAndUpdate(query, update, options, callback);
};

//get vote traffic by Object1
module.exports.getDocTrafficByObject1 = function(source, callback){ //no limit cos there's only one object parsed, and use singular term for object
  var query = {
    Object1: source,
    Relationship: {$ne: "peer"},
    Relationship: {$ne: ""}
  };

  Doc.aggregate(
    {$match: query},
    {$project: {
      _id:0,
      Object1:1,
      Object2:1,
      Relationship:1,
      netCompetitor: {$sum: "$Traffic.Competitor.User.vote_type"},
      netSupplier: {$sum: "$Traffic.Supplier.User.vote_type"},
      netClient: {$sum: "$Traffic.Client.User.vote_type"},
      netSister: {$sum: "$Traffic.Sister.User.vote_type"},
      netSubsidiary: {$sum: "$Traffic.Subsidiary.User.vote_type"},
      netParent: {$sum: "$Traffic.Parent.User.vote_type"},
      totalCompetitor: {$sum:
        "$Traffic.Competitor.User.vote_count"},
      totalSupplier: {$sum:
        "$Traffic.Supplier.User.vote_count"},
      totalClient: {$sum:
        "$Traffic.Client.User.vote_count"},
      totalSister: {$sum:
        "$Traffic.Sister.User.vote_count"},
      totalSubsidiary: {$sum:
        "$Traffic.Subsidiary.User.vote_count"},
      totalParent: {$sum:
        "$Traffic.Parent.User.vote_count"}
    }},
    {$project: {
      _id:0,
      source:"$Object1",
      target:"$Object2",
      defaultRelationship: "$Relationship",
      Competitor: "$netCompetitor",
      Supplier: "$netSupplier",
      Client: "$netClient",
      Sister: "$netSister",
      Subsidiary: "$netSubsidiary",
      Parent: "$netParent",
      totalVotes: {$sum: [
        "$totalCompetitor", "$totalSupplier", "$totalClient", "$totalSister", "$totalSubsidiary", "$totalParent"
      ]}
    }}
  )
    .exec(callback);
};

//get vote traffic by Object2
module.exports.getDocTrafficByObject2 = function(source, callback){ //no limit cos there's only one object parsed, and use singular term for object
  var query = {
    Object2: source,
    Relationship: {$ne: "peer"},
    Relationship: {$ne: ""}
  };

  Doc.aggregate(
    {$match: query},
    {$project: {
      _id:0,
      Object1:1,
      Object2:1,
      Relationship:1,
      netCompetitor: {$sum: "$Traffic.Competitor.User.vote_type"},
      netSupplier: {$sum: "$Traffic.Supplier.User.vote_type"},
      netClient: {$sum: "$Traffic.Client.User.vote_type"},
      netSister: {$sum: "$Traffic.Sister.User.vote_type"},
      netSubsidiary: {$sum: "$Traffic.Subsidiary.User.vote_type"},
      netParent: {$sum: "$Traffic.Parent.User.vote_type"},
      totalCompetitor: {$sum:
        "$Traffic.Competitor.User.vote_count"},
      totalSupplier: {$sum:
        "$Traffic.Supplier.User.vote_count"},
      totalClient: {$sum:
        "$Traffic.Client.User.vote_count"},
      totalSister: {$sum:
        "$Traffic.Sister.User.vote_count"},
      totalSubsidiary: {$sum:
        "$Traffic.Subsidiary.User.vote_count"},
      totalParent: {$sum:
        "$Traffic.Parent.User.vote_count"}
    }},
    {$project: {
      _id:0,
      source:"$Object2",
      target:"$Object1",
      defaultRelationship: "$Relationship",
      Competitor: "$netCompetitor",
      Supplier: "$netSupplier",
      Client: "$netClient",
      Sister: "$netSister",
      Subsidiary: "$netSubsidiary",
      Parent: "$netParent",
      totalVotes: {$sum: [
        "$totalCompetitor", "$totalSupplier", "$totalClient", "$totalSister", "$totalSubsidiary", "$totalParent"
      ]}
    }}
  )
    .exec(callback);
};

//get vote traffic by Source and Target
module.exports.getDocTrafficBySourceAndTarget = function(source, target, callback){ //no limit cos there's only one object parsed, and use singular term for object
  var query = {
    Object1: source,
    Object2: target,
    Relationship: {$ne: "peer"},
    Relationship: {$ne: ""}
  };

  Doc.aggregate(
    {$match: query},
    {$project: {
      _id:0,
      Object1:1,
      Object2:1,
      Relationship:1,
      netCompetitor: {$sum: "$Traffic.Competitor.User.vote_type"},
      netSupplier: {$sum: "$Traffic.Supplier.User.vote_type"},
      netClient: {$sum: "$Traffic.Client.User.vote_type"},
      netSister: {$sum: "$Traffic.Sister.User.vote_type"},
      netSubsidiary: {$sum: "$Traffic.Subsidiary.User.vote_type"},
      netParent: {$sum: "$Traffic.Parent.User.vote_type"},
      totalCompetitor: {$sum:
        "$Traffic.Competitor.User.vote_count"},
      totalSupplier: {$sum:
        "$Traffic.Supplier.User.vote_count"},
      totalClient: {$sum:
        "$Traffic.Client.User.vote_count"},
      totalSister: {$sum:
        "$Traffic.Sister.User.vote_count"},
      totalSubsidiary: {$sum:
        "$Traffic.Subsidiary.User.vote_count"},
      totalParent: {$sum:
        "$Traffic.Parent.User.vote_count"}
    }},
    {$project: {
      _id:0,
      source:"$Object1",
      target:"$Object2",
      defaultRelationship: "$Relationship",
      Competitor: "$netCompetitor",
      Supplier: "$netSupplier",
      Client: "$netClient",
      Sister: "$netSister",
      Subsidiary: "$netSubsidiary",
      Parent: "$netParent",
      totalVotes: {$sum: [
        "$totalCompetitor", "$totalSupplier", "$totalClient", "$totalSister", "$totalSubsidiary", "$totalParent"
      ]}
    }}
  )
    .exec(callback);
};

//get vote traffic by Target and Source
module.exports.getDocTrafficByTargetAndSource = function(source, target, callback){ //no limit cos there's only one object parsed, and use singular term for object
  var query = {
    Object2: source,
    Object1: target,
    Relationship: {$ne: "peer"},
    Relationship: {$ne: ""}
  };

  Doc.aggregate(
    {$match: query},
    {$project: {
      _id:0,
      Object1:1,
      Object2:1,
      Relationship:1,
      netCompetitor: {$sum: "$Traffic.Competitor.User.vote_type"},
      netSupplier: {$sum: "$Traffic.Supplier.User.vote_type"},
      netClient: {$sum: "$Traffic.Client.User.vote_type"},
      netSister: {$sum: "$Traffic.Sister.User.vote_type"},
      netSubsidiary: {$sum: "$Traffic.Subsidiary.User.vote_type"},
      netParent: {$sum: "$Traffic.Parent.User.vote_type"},
      totalCompetitor: {$sum:
        "$Traffic.Competitor.User.vote_count"},
      totalSupplier: {$sum:
        "$Traffic.Supplier.User.vote_count"},
      totalClient: {$sum:
        "$Traffic.Client.User.vote_count"},
      totalSister: {$sum:
        "$Traffic.Sister.User.vote_count"},
      totalSubsidiary: {$sum:
        "$Traffic.Subsidiary.User.vote_count"},
      totalParent: {$sum:
        "$Traffic.Parent.User.vote_count"}
    }},
    {$project: {
      _id:0,
      source:"$Object2",
      target:"$Object1",
      defaultRelationship: "$Relationship",
      Competitor: "$netCompetitor",
      Supplier: "$netSupplier",
      Client: "$netClient",
      Sister: "$netSister",
      Subsidiary: "$netSubsidiary",
      Parent: "$netParent",
      totalVotes: {$sum: [
        "$totalCompetitor", "$totalSupplier", "$totalClient", "$totalSister", "$totalSubsidiary", "$totalParent"
      ]}
    }}
  )
    .exec(callback);
};

//update doc news
module.exports.updateNews = function(source, target, headlines, dates, abstracts, options, callback){
  var query = {Object1: source, Object2: target};
  var update = {
    "News.Headlines": headlines,
    "News.Dates": dates,
    "News.Abstracts": abstracts
  };
  Doc.findOneAndUpdate(query, update, options, callback);
};
