

// Opening the Sidebar-wrapper on Hover
$(".sidebar-nav").hover(function(e)							//declare the element event ...'(e)' = event (shorthand)
{
    //  $("#wrapper").toggleClass("toggled",true);		//instead on click event toggle active CSS element
    //  e.preventDefault();										        //prevent the default action ("Do not remove as the code
});


$('#sidebar-wrapper').mouseleave(function(e)		//declare the jQuery: mouseleave() event
                                               // - see: ('//api.jquery.com/mouseleave/' for details)
{
    return true; // Do nothing.
                                             /*! .toggleClass( className, state ) */
    $('#wrapper').toggleClass('toggled',false);		/* toggleClass: Add or remove one or more classes from each element
                                                 in the set of matched elements, depending on either the class's
                                                 presence or the value of the state argument */
    e.stopPropagation();									//Prevents the event from bubbling up the DOM tree
                                         // - see: ('//api.jquery.com/event.stopPropagation/' for details)

    e.preventDefault();										// Prevent the default action of the event will not be triggered
                                         // - see: ('//api.jquery.com/event.preventDefault/' for details)
});

//SLIDER JS

    function toggleNode(node, hideNode) {
        // huidige node verbergen of weergeven
        nodes.update({id: node.id, hidden: hideNode});

        // alle verbonden edges verbergen wanneer de node verborgen is
        edges.forEach(function(edge) {
          var isConnectedToNode = (edge.from == node.id) || (edge.to == node.id);

          if (isConnectedToNode && hideNode) {
               edges.update({id: edge.id, hidden: true});
           }
        });
    }

   function showAllNodes()
   {
       edges.forEach(function(edge) {
           edges.update({id: edge.id, hidden: false});
       });
   }

  //
  $('#weight-slider').change(function() {
       var weight = $(this).val();

       showAllNodes();

       // hide the nodes that are below weight
       nodes.forEach(function(node) {
           var nodeWeightBelowThreshold = (node.weight < weight);
           var nodeIsHidden = nodeWeightBelowThreshold;
           toggleNode(node, nodeIsHidden);
      });
  });
