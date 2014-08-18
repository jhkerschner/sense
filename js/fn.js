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