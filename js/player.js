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