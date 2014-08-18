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
      getting : "You pick up the sword.",
      sightDescription : "The blade is pitted with age.",
      touch: "You carefully rub your thumb across different points on the blade. It would benefit from a good sharpening."
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