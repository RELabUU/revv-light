$(document).ready(function() {
    $('#relationshipselector').multiselect({

    // dropRight: true
    enableClickableOptGroups: true,
    enableCollapsibleOptGroups: true,
    enableFiltering: true,
    includeSelectAllOption: true,
    maxHeight: 400,
    enableCaseInsensitiveFiltering: true,
onChange: function(option, checked, select){		//use the onChange event to listen to changes in the listbox
      var values = $('#relationshipselector option:selected');//add the selected options to a var

      var selectedGroups = $(values).map(function(index, option){			//???
          return $(option).val();		//put the values in the array
});

      selectedGroups = selectedGroups.toArray();

      // window.s = selectedGroups;
      // console.log(selectedGroups);

      // show all edges
      edges.forEach(function(edge) {
             edges.update({id: edge.id, hidden: false});
          });
        //
       nodes.forEach(function(node) {
         var groupIsSelected = (selectedGroups.indexOf(node.group) != -1);
         nodes.update({id: node.id, hidden: groupIsSelected});

         edges.forEach(function(edge) {
              //go through all edges
             // if an edge is connected to one of the nodes in the loop...
             var isConnectedToNode = (edge.from == node.id) || (edge.to == node.id);
             //...make it hidden
             if (isConnectedToNode && groupIsSelected) {
                  edges.update({id: edge.id, hidden: true});
              }
          });
      });


},

buttonText: function(options, select) {
     return 'Relationships';
  },
  onInitialized: function(select, container) {
          var $button = container.find("button").eq(0);
          $button.append('<span class="multiselect_icon sub_icon glyphicon glyphicon-random"" aria-hidden="true"></span>');
          console.log($button);

      }

});
  $('#roleselector').multiselect({
    enableClickableOptGroups: true,
    enableCollapsibleOptGroups: true,
    enableFiltering: true,
    includeSelectAllOption: true,
    maxHeight: 400,
    enableCaseInsensitiveFiltering: true,
      buttonText: function(options, select) {
         return 'Stakeholders';
      },
      onInitialized: function(select, container) {
              var $button = container.find("button").eq(0);
              $button.append('<span class="multiselect_icon sub_icon fa fa-users" aria-hidden="true"></span>');
              console.log($button);

          }
  });
  
  
  
  
    $('#conceptstateselector').multiselect({
    enableClickableOptGroups: true,
    enableCollapsibleOptGroups: true,
    enableFiltering: true,
    includeSelectAllOption: true,
    maxHeight: 400,
    enableCaseInsensitiveFiltering: true,
      buttonText: function(options, select) {
         return 'Concept states';
      },
      onInitialized: function(select, container) {
              var $button = container.find("button").eq(0);
              $button.append('<span class="multiselect_icon sub_icon fa fa-dot-circle-o" aria-hidden="true"></span>');
              console.log($button);

          }
  });
  
  
    $('#associationselector').multiselect({
    enableClickableOptGroups: true,
    enableCollapsibleOptGroups: true,
    enableFiltering: true,
    includeSelectAllOption: true,
    maxHeight: 400,
    enableCaseInsensitiveFiltering: true,
      buttonText: function(options, select) {
         return 'Associations';
      },
      onInitialized: function(select, container) {
              var $button = container.find("button").eq(0);
              $button.append('<span class="multiselect_icon sub_icon fa fa-random" aria-hidden="true"></span>');
              console.log($button);

          }
  });
  
  
  
  
  

  
  
  
  
});
