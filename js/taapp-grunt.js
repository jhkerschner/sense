(function(window,$){
	window.app = {
		//structure goes here
		//ie: rooms:[], ...
	};
})(window, $);
(function(window,$,app){
//Utiltity Functions
//Get the right indefinite article
app.fn = {
  article : function() {
		var ch = arguments[0].charAt(0);
		if(ch=='A'||ch=='a'||ch=='E'||ch=='e'||ch=='I'||ch=='i'||ch=='O'||ch=='o'||ch=='U'||ch=='u'){
      return 'an ';
    }else{
      return 'a ';
    }
	},
	getParamNames: function(theFunction) {
    var funStr = theFunction.toString();
    return funStr.slice(funStr.indexOf('(')+1, funStr.indexOf(')')).match(/([^\s,]+)/g) || '';
  },
  //get nested items to look at and get their locations in the container
  getNestedItems: function(container){
    var items = [];
    //var itemMap = [];
    function pushItems(container){
      if (container.length > 0){
        var numItems = container.length;
        for (var i = 0; i < numItems; i++) {
          //pathto.push(container.indexOf(container[i]))
          //console.log(container[i].descriptor[0] + " ")
          items.push(container[i]);
          if (container[i].isContainer) {
            pushItems(container[i].containedItems);
          }
        }
      }else{
        return items;
      }
      return items;
    }
    return pushItems(container);
  },
  getPathTo: function(container, item){
    var pathto = [];
    function drill(container, item){
      //console.log(container +" "+ item)
      if (container.length > 0){
        var numItems = container.length,
            itemPath = [];
        for (var i = 0; i < numItems; i++) {
          pathto.push(container.indexOf(container[i]))
          console.log(container[i].descriptor[0] + " " + pathto);
          if (item.descriptor[0] == container[i].descriptor[0]){
            console.log("fuck yeah")
            itemPath = pathto;
            break;
          }else if (container[i].isContainer) {
            drill(container[i].containedItems, item);
          }
          pathto.pop();
        }
        return itemPath;
      }else{
        return pathto;
      }
    }
    //console.log(item);
    return drill(container, item);
  }
};

})(window, $, window.app || {});
(function(window,$,app){

//Item class
app.Item = function Item(opts){
  var options = opts || {};
  this.ambientLight = options.ambientLight || 0;
  this.isStationary = options.isStationary || false;
  this.descriptor = options.descriptor;
  this.isContainer = options.isContainer || false;
  this.containedItems = options.containedItems || [];
  this.comprisedOf = options.comprisedOf || [];
  this.combineWith = options.combineWith || [];
  this.getting = options.getting;
  this.sightDescription = options.sightDescription;
  this.visualSecret = options.visualSecret;
  this.visualSecretThreshold = options.visualSecretThreshold || 8;
  this.sounds = options.sounds;
  this.tastes = options.tastes;
  this.smells = options.smells;
  this.touch = options.touch;
  this.dropping = options.dropping;
};

app.Item.prototype = {
  listContainedItems:function(){
    if (!this.isContainer){
      return 'The ' + this.descriptor[0] + ' isn\'t a container.'
    }
    //get contained items
    var numContained = this.containedItems.length,
        list = [];
    if (numContained == 0) {
      return "The container is empty :(";
    }
    for (var i = 0; i < numContained; i++ ){
      list.push(this.containedItems[i].descriptor[0]);
    }
    return "<p>The "+this.descriptor[0]+" contains:</p>" + list.join('<br />');
  }
  //,
  // hasItem:function(whichItem, container){
  //   console.log("item here");
  //   for (var i = 0; i < container.length; i++) {
  //     if (whichItem === container[i]) {
  //       return true;
  //     }
  //   }
  //   for (var i = 0; i < container.length; i++) {
  //     if (container[i].isContainer){
  //       this.hasItem(whichItem, container[i].containedItems);
  //     }
  //   }
  // }
  
  // getDescriptor:function(){
  //   if(typeof this.descriptor !== "undefined")
  //     return app.fn.article(this.descriptor) + this.descriptor;
  //   else
  //     return 'It has no name';
  // }
};

})(window, $, window.app || {});
(function(window,$,app){
//Player class
  app.Player = function Player(playerData){
    var data = playerData || {};
    this.inventory = data.inventory || {};
    this.discoveredItems = data.discoveredItems || [];
    this.playerName = data.playerName || "Anonymous";
  };

  app.Player.prototype = {
    //May be usefull for certain functions
    holdBothItems:function(theItems){
      if (theItems.length > 2)
        return "You fumble around trying to hold all of those things.";
      if (theItems.length < 2)
        return "You wonder what the " + theItems[0].descriptor[0] + " could be combined with.";
      return true;
    },
    //Todo: Make a universal itemMatch function
    hasItem:function(whichItem, container){

      function itemMatch(whichItem, container){
        var numItems = container.length;
        for (var i = 0; i < numItems; i++) {
          var match = false;
          if (whichItem.descriptor[0] === container[i].descriptor[0]) {
            console.log (whichItem.descriptor[0]);
            console.log (container[i].descriptor[0]);
            match = true;
            break;
          }else if (container[i].isContainer){
            itemMatch(whichItem, container[i].containedItems);
          }
          if (match){
            return match;
          }
        }
        return match;
      }
      
      return itemMatch(whichItem, container);
    },
    look:function(theItem, room){
      // general vision check
      if (room.ambientLight <= 0) 
        return "The inky blackness of your surroundings makes it impossible to see.";
      
      // does theItem contain multiple items?
      if (theItem.length >= 2)
        return 'Try as you might, your eyes will not focus on more than one item.';
      // unwrap the item array
      var item = theItem[0],
          theSights = theItem[0].sightDescription || 'It looks like ' + app.fn.article(item.descriptor[0]) + item.descriptor[0] + ', nothing more.';
      
      // Visual secret check for items
      // If you can see clearly you will get more hints
      if ((item.visualSecret) && (room.ambientLight >= item.visualSecretThreshold)) {
        var secretSight = item.visualSecret;
        theSights = theSights.concat(" " + secretSight);
      }
      if (item === room){
        theSights += item.listContainedItems();
      }
      return theSights 
      
    },
    listen:function(theItem, room){
      if (theItem.length < 2){
        return theItem[0].sounds || "The " + theItem[0].descriptor[0] + " isn't emmitting any sounds.";
      }else{
        return 'You think it would be better to listen to one object at a time.';
      }
    },
    taste:function(theItem, room){
      if (theItem.length < 2){
        return theItem[0].tastes || "No taste really but you suddenly wonder where the " + theItem[0].descriptor[0] + " has been.";
      }else{
        return 'You think it would be better to taste one object at a time.';
      }
    },
    smell:function(theItem, room){
      if (theItem.length < 2){
        return theItem[0].smells || "There is a slight smell but you can't tell if it's from the item your fingers or the inside of your nose.";
      }else{
        return 'You think it would be better to smell one object at a time';
      }
    },
    touch:function(theItem, room){
      if (theItem.length < 2){
        return theItem[0].touch || 'It feels like ' + app.fn.article(theItem[0].descriptor[0]) + theItem[0].descriptor[0];
      }else{
        return 'You think it would be better to touch one object at a time';
      }
    },
    combine:function(theItems, room, itemLibrary){
      
      if (theItems[0].combineWith == theItems[1].descriptor[0]){
        var numItems = Object.keys(itemLibrary).length;
        //loop through the items library and push the made item to the players inventory
        for (var i = numItems - 1; i >= 2; i--) {
          var libraryItem = itemLibrary[Object.keys(itemLibrary)[i]],
              itemComprisedOf = libraryItem.comprisedOf.sort().join(),
              theseItems = theItems.sort().join();
          if (itemComprisedOf == theseItems){
            this.inventory.push(libraryItem);
            var index1 = this.inventory.indexOf(theItems[0]);
            this.inventory.splice(index1, 1);
            var index2 = this.inventory.indexOf(theItems[1]);
            this.inventory.splice(index2, 1);
            return "you made a item";
          }
        }
      }else{
        return "You made nothing"
      }
    },
    disassemble:function(){
      //check to see if item is comprised of other items (are there items in the comprisedOf array)
      //put contained items in character inv
      //destroy item
    },
    checkInventory:function(player){
          var numItems = player.inventory.length;
          if (numItems>0){
            var foundItems = 'You have:<br />';
            for (var i = 0; i < numItems; i++) {
              foundItems +=  player.inventory[i].descriptor[0] +'<br />';
            }
            return foundItems;
          }else{
            return 'You have nothing on your person.';
          }
        
    },
    search:function(theItem, room){
      if (theItem.length >= 2){
        return 'You think it would be better to search one object at a time';
      }
      //TODO: Look into using the items list contained items function
      var item = theItem[0],
          numItems = item.containedItems.length;
      if (!item.isContainer){
        return 'The ' + item.descriptor[0] + ' isn\'t a container.'
      }
      
      if (numItems > 0){
        var foundItems = 'In the ' + item.descriptor[0] + ' You find:<br />';
        for (var i = 0; i < numItems; i++) {
          foundItems +=  item.containedItems[i].descriptor[0] +'<br />';
        }
        return foundItems;
      }else{
        return 'You grope around in the ' + item.descriptor[0] + ', but find nothing.';
      }
    },
    //Take should only work on items you don't have
    take:function(theItem, room){
      if (theItem.length >= 2){
        return 'You fumble around and end up with nothing.';
      }
      var item = theItem[0];
      if (item.isStationary){
        return 'You don\'t think that is possible.';
      }
      console.log(this.hasItem(item, this.inventory));
      if (this.hasItem(item, this.inventory)){
        return 'You already have the ' + item.descriptor[0];
      }
      var taken = '',
          index = '';
      
      for (i=0;i<room.containedItems.length; i++){
        if (item === room.containedItems[i]){
          index = room.containedItems.indexOf(item)
          room.containedItems.splice(index, 1);
          this.inventory.push(item);
          taken += item.descriptor[0];
          return item.getting || 'You take the: <br>' + taken;
        }
      }
      numItems = room.containedItems.length;
      for (j=0; j<numItems; j++){
        index = room.containedItems[j].containedItems.indexOf(item)
        room.containedItems[j].containedItems.splice(index, 1);
        this.inventory.push(item);
        taken += item.descriptor[0];
        return item.getting || 'You take the: <br>' + taken;
      }
    },
    drop:function(theItem, room){
      if (theItem.length >= 2){
        return 'You think it would be better to drop one object at a time';
      }
      var dropped = '',      
          item = theItem[0]
      if (!this.hasItem(item, this.inventory)){
        return 'You can\'t drop something you don\'t have';
      }
      var index = this.inventory.indexOf(item);
      this.inventory.splice(index, 1);
      room.containedItems.push(item);
      return 'You drop the: <br>' + item.descriptor[0];

    },
    put:function(theItems, room){
      //console.log(theItems);
      var numItems = theItems.length;
      if (numItems < 2){
        return "You need an item and a container for that to work.";
      }
      if (numItems > 2){
        return "Try putting one item in at a time."
      }
      var item = theItems[0];
          container = theItems[1];
      if (item.isStationary){
        return 'You cannot put a stationary object like the ' + item.descriptor[0] + " in the "+ container.descriptor[0];
      }
      if (!container.isContainer){
        return "The second item is not a container."
      }
      
      var path = app.fn.getPathTo(this.inventory, item);
        console.log(path);

      // if (this.hasItem(item)){
      //   this.inventory + path
      //   playerItems.splice(index, 1);
        //console.log(app.fn.getDeepIndex);
       
          
        
            //if (itemIndexInfo[0] === 0)
            //itemParent = this.inventory[itemIndexInfo[0]],
            //itemIndex = itemIndexInfo[1];

        //itemParent.splice(itemIndex, 1);
        //container.containedItems.push(item);
      //   return "You put the " +item.descriptor[0]+" in the "+container.descriptor[0]+"."
      // }else if(room.hasItem(item, room.containedItems)){
      //   var index = room.containedItems.indexOf(item);
      //   room.containedItems.splice(index, 1);
      //   container.containedItems.push(item);
      //   return "You put the " +item.descriptor[0]+" in the "+container.descriptor[0]+"."
      // }else{
      //   return "The item is not within your grasp!"
      // }
        
    }
  };
})(window, $, window.app || {});
(function(window,$,app){
//Weapon class (sub)
  app.Weapon = function Weapon(opts){
    this.weapon = "yes.";
  };

  app.Weapon.prototype = new app.Item();
  app.Weapon.prototype.swing = function(){
    //console.log("swing");
  };

})(window, $, window.app || {});
(function(window,$,app){
//Room class
app.Room = function Room(opts){
  var options = opts || {}; // Null Object Protection
  this.ambientLight = options.ambientLight || 0;
  this.isContainer = options.isContainer || true;
  this.containedItems = options.containedItems || [];
  this.descriptor = options.descriptor;
  this.sightDescription = options.sightDescription;
  this.visualSecret = options.visualSecret;
  this.visualSecretThreshold = options.visualSecretThreshold || 1;
  this.sounds = options.sounds;
  this.taste = options.taste;
  this.smells = options.smells;
  this.touch = options.touch;
};
app.Room.prototype = new app.Item({
  broadcastChat:function(player, message){
    return player.playerName + 'says, \"' + message + '\"';
  }
});
// app.Room.prototype = {
//   // listContainedItems:function(){
//   //   //get contained items
//   //   var numContained = this.containedItems.length,
//   //       list = [];
//   //   if (numContained !== 0) {
//   //     for (var i = 0; i < numContained; i++ ){
//   //       list.push(this.containedItems[i].descriptor[0]);
//   //     }
//   //     return "<p>In the room there is:<br />" + list.join('<br />') + '</p>';
//   //   }else{
//   //     return "There is nothing  :(";
//   //   }
//   // }
//   //   updateSights:function(){
//   //     this.sights = this.sightDescription + this.listContainedItems();
//   //   }
//   // hasItem:function(whichItem){
//   //   //loop through discoveredItems
//   //   for (var i = 0; i < this.discoveredItems.length; i++) {
//   //     if (whichItem === this.discoveredItems[i].descriptor) {
//   //       return true;
//   //     }
//   //   }
//   // }
//   //Move items from discoverd to hidden
// };

})(window, $, window.app || {});
(function(window,$,app){
    //Create Items
    //TODO: Fix this maybe -> The order the items are created are important
    //items first then containers followed by room and player
    var items = {};
    
    items.flint = new app.Item({
      descriptor : ["flint"],
      combineWith : "stone"
    });
    items.stick = new app.Item({
      descriptor : ["stick"]
    });
    items.string = new app.Item({
      descriptor : ["string"]
    });
    items.rune = new app.Item({
      descriptor : ["rune"],
      sightDescription : "It is a stone with a rune carved in it. It probably has hidden power."
    })
    items.stone = new app.Item({
      descriptor : ["stone", "flagstone", "rock"]
    });
    items.steel = new app.Item({
      descriptor : ["steel"]
    });
    items.flintStone = new app.Item({
      descriptor : ["tinderbox"],
      sightDescription : "you can light stuff with it",
      comprisedOf : [items.flint, items.steel]
    });
    items.pouch = new app.Item({
      isContainer : true,
      descriptor : ["pouch"],
      containedItems : [items.string]
    });
    items.bag2 = new app.Item({
      isContainer : true,
      descriptor : ["bag2"],
      containedItems : [items.rune, items.pouch]
    })
    items.bag = new app.Item({
      isContainer : true,
      descriptor : ["bag"],
      containedItems : []
    });
    items.puddle = new app.Item({
      isStationary : true,
      descriptor : ["puddle"],
      isContainer : true,
      containedItems : [items.flint, items.steel, items.stone],
      visualSecretThreshold : 6,
      sightDescription : "Rings of light ripple out from the center as drops fall into it from above.",
      visualSecret : "As you look closer you can see that there is some depth to it!",
      sounds : "The only sounds are those of the liquid dripping into it.",
      tastes : "It tastes like keroseen!",
      smells : "The puddle smells like something you would remove paint with."
    });
    items.capris = new app.Item({
      descriptor : ["capris", "pants"],
      sightDescription : "Hemmed right above the calve, they'll make anybody wearing them look like an idiot.",
      sounds : "They make a quiet swishing sound when you walk (stealth -1).",
      tastes : "You probably don't want to do that.",
      smells : "You probably don't want to do that.",
      touch : "They feel light and agile (agility +2)."
    });
    items.sword = new app.Item({
      descriptor : ["sword"],
      getting : "You pick up the blade and are amazed at how light it feels.",
      sightDescription : "It's the most badass thing you have ever laid your eyes on!",
      sounds : "Tilting your ear toward it, you can almost hear the whispers and cries of those that fell before it"
    });
    //Create Room Object passing descriptions and items in
    var currentRoom = new app.Room({
      descriptor : ["room","cell","area","here"],
      ambientLight : 10,
      containedItems : [items.puddle, items.sword],
      visualSecretThreshold : 5,
      visualSecret : "There is some writing on the wall. Scratched into the stone, it reads. RDA was here.",
      sightDescription : "You are in a small 10'x10' room with roughly hewn stone walls joined together flawlessly without mortar. The floor is of the same material but larger and smoother tiles. There are no obvious exits except for a large iron door.",
      sounds : "drip... drip... drip... The dripping noise is slow and even. It sounds as though droplets are falling into a small puddle nearby, close enough to reach out and touch.",
      touch : "It's cool where you are. You feel solid and cold stone beneath your feet.",
      smells : "You sniff the air and are assaulted with the smell of decay and hint of lamp oil."
    });
    // var room2 = new app.Room({
    //   descriptor : ["room2"],
    //   containedItems : [items.stone]
    // });
    
    //Create Player
    var currentPlayer = new app.Player(
      {
        playerName : "You",
        inventory : [items.bag2, items.capris, items.bag]
      }
    );
  //Testing function
  $(function(){

    //declare some variables for the ui
    var textNode = $("#readout-content"),
        inputNode = $("#text-input"),
        buttonNode = $("#hidden-button");

    //read function
    var read = function(value){
      var dict = {
        'help' : '<p>All you have are your senses (<span class="verb_hint">look, listen, feel, smell, taste)</span><br />Example Commands:<br /><span class="verb_hint">look</span> <span class="noun_hint">puddle</span> <br /><span class="verb_hint">listen</span><br /><em>Enter commands below.</em></p>',
        'save' : '<p>Your progress has been saved in the imperial scrolls of honor... not really, but soon. Consider it hardcore mode!</p>',
      }
      var str = value.toLowerCase(),
          words = str.split(" ");
      if (words[0] == "save") {
        textNode.append(dict.save);
      }else if (words[0] == "help"){
        textNode.append(dict.help);
      }else if (words[0] == "inv" || words[0] == "inventory"){
        narration = currentPlayer.checkInventory(currentPlayer);
        textNode.append('<p>' + narration + '</p>');
      }else if (words.length >= 1){
        //have the player process the complete command
        narration = comprehend(words, currentRoom);
        textNode.append('<p>' + narration + '</p>');
      }
    };
    //comprehend function
    var comprehend = function(words, currentRoom){
      /*
      // This function takes the strArray from the user input and processes it into a usable command for the
      // currentPlayer functions. It then calls the function and passes item and room information.
      */
      // Set the verb and modify the words array
      var verb = '',
          nouns = [],
          numWords = words.length;
      for (var i = 0; i < numWords; i++){
        var word = words[i];
        if (typeof currentPlayer[word] === "function"){
          verb = words[i];
          var verbIndex = words.lastIndexOf(words[i]);
          words.splice(verbIndex, 1);
          break;
        }
      }
      //// Set a couple very useful variables here
      var playerItems = app.fn.getNestedItems(currentPlayer.inventory),
          roomItems = app.fn.getNestedItems(currentRoom.containedItems);
          //console.log(roomItems)
          //console.log(playerItems)
      // push to the nouns array
      var availableItems = playerItems.concat(roomItems).concat(currentRoom),
          numItems = availableItems.length;
      if (numWords > 1){
        //loop the words and check it against the available items
        for (var j = 0; j < numWords; j++) {
          for (var k = 0; k < numItems; k++) {
            //Check the descriptor array against the words
            var numNames = availableItems[k].descriptor.length;
            for (var l = 0; l < numNames; l++) {
              // Check to see if any of the words match an available item and push the available item
              if (availableItems[k].descriptor[l] === words[j]) {
                nouns.push(availableItems[k]);
              }
            }
          }
        }
      }else{
        nouns.push(currentRoom);
      }
      //// call the function with the verb and nouns
      if (verb){
        var numNouns = nouns.length,
            itemLibrary = items;
        if (numNouns > 0){
          return currentPlayer[verb](nouns, currentRoom, itemLibrary);
        }else{
          return "There is no " + words.join(" ") + " for which to " + verb;
        }
      }else{
        return "Although it may be your wish to " + words.join(" ") + ". What would be the point?";
      }
    };

    //Place the cursor in the input
    inputNode.focus();
    //Run a function when user hits enter
    inputNode.on("keyup",function(event){
      if(event.keyCode === 13){
        var value = $(this).val();
        if (value !== ''){
          //run the read funtion
          read(value);
          this.value = '';
        }else{
          textNode.append("Sometimes the best course of action is to take no action, but that's not the case here.");
        }
        $('.readout').animate({ scrollTop: $('.readout-content').height() }, "fast"); 
      }
    });
});
})(window, $, window.app || {});