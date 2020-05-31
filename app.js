//Link of Deployed App : https://mighty-crag-93618.herokuapp.com/

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js")

const app = express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-chirag:7597550171@cluster0-ujfjq.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Eat"
});

const item2 = new Item ({
  name: "Code"
});

const item3 = new Item ({
  name: "Sleep"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
  // let day = date.getDate();

  Item.find({}, function(err, foundItems){
    //check whether item is empty or not so that repition doesn't occur
    if(foundItems.length==0){
      Item.insertMany(defaultItems, function(err){
        if(err)
          console.log(err);
        else
          console.log("Successfully Saved");
      });
      res.redirect("/");
    }
    else{
          res.render("list",{listTitle: "Today", newListItems: foundItems});
    }
  });

});

//Parameters Link
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        //Show an existing lit
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
})


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

  // if(req.body.list === "Work"){
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }

});

app.post("/delete", function(req, res){
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkItemId, function(err){
      if(!err){
        console.log("Deleted");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkItemId}}},
      function(err, foundList){
        if(!err){res.redirect("/"+listName);}
      }
    )
  }
});

// app.get("/work", function(req, res){
//   res.render("list",{
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

// app.post("/work", function(req, res){
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work")
// });

app.get("/about", function(req, res){
  res.render("about");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
// app.listen(port);


app.listen(port, function(){
  console.log("Server started on port 3000");
});
