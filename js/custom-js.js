//
//	CONCEPT CLUSTERING
//

//PREPARE CLUSTER DATA
var conceptContextSimilarityScores = [];

for (var i in concepts) {
	conceptContextSimilarityScores[i] = [];
}

for (var key in concepts) {
	if(arrayConceptPairs[key] != undefined){
		for (i = 0; i < countProperties(arrayConceptPairs); i++) {
		
			if(arrayConceptPairs[key][i] != undefined){
				conceptContextSimilarityScores[key].push(arrayConceptPairs[key][i]["contextCosineSimilarityScore"]);

			}
	
		}
	
	}
							
	for (i = 0; i < countProperties(arrayConceptPairs); i++) {
		if(arrayConceptPairs[i] != undefined){
			if(arrayConceptPairs[i][key] != undefined){
				conceptContextSimilarityScores[key].push(arrayConceptPairs[i][key]["contextCosineSimilarityScore"]);
				
					
			}
				
		}
			
	}
		
}

//console.log(conceptContextSimilarityScores);
//END PREPARE CLUSTER DATA


$("#cluster_view").click(function() {
	$(".viewButton").removeClass( "selectedView" );
	$(".node").removeClass( "nodeClicked" );
	$(".nodeText").removeClass( "nodeTextClicked" );

	
	$("#cluster_view").addClass( "selectedView" );
	
	currentView = 1;
	$(".node").removeClass( "nodeShareUserStories" );
	$( "#venn_overlay" ).removeClass("venn_overlay_black");
	$( "#playgraph" ).removeClass("positionAbsolute");
	$( ".venn-area" ).css('opacity', '1.0');

	changeNodeColorsClusterView();

});





function displayHelpWindow(key) {
	var position = $('#helpIcon'+key).offset();
	var positionTop = position.top+8;
	var positionLeft = position.left+8;
	
	var content = "";
	
	if(key == 1) {
		content = "(1) Use the <a href='https://github.com/RELabUU/visual-narrator-adapted-for-revv' target='_blank' title='Visual Narrator'>Visual Narrator</a> to create a report from a set of user stories. (2) Upload this report to create a visualization of the set of user stories.";
	}
	
	if(key == 2) {
		content = "The <b><i>Similarity view</i></b> shows how potential ambiguous concepts are:<ul><li>A <span style='background-color:#ff0000; padding:2px;'>red</span> color indicates the concepts are highly ambiguous;</li><li>A <span style='background-color:#ffff00; padding:2px;'>yellow</span> color indicates the concept are somewhat ambiguous;</li><li>A <span style='background-color:#00ff00; padding:2px;'>green</span> color indicates the concepts are not ambiguous.</li>";
	}
	
	if(key == 3) {
		content = "The <b><i>Cluster view</i></b> shows in what cluster a concept is grouped. Concepts are clustered based on how related the user stories in which they appear are. A concept can be inspected by clicking on it. This highlights all concepts that share user stories with the concept that is clicked on.";
	}
	
	content = content + "<div onclick='closeHelpWindow("+key+")' class='closeHelpWindow'>X</div>";
	
	$("body").append('<div class="window helpWindow helpWindow_'+key+'" style="top:'+positionTop+'px; left:'+positionLeft+'px;">'+content+'</div>');
   
	$( function() {
		$( ".window" ).draggable();
	
	});
	
}


function displayAssociationWindow(key) {
	var position = $('.association_'+key).offset();
	var positionTop = position.top+8;
	var positionLeft = position.left+6;
	
	var associationId = associations[key]['associationId'];
	var roleId = associations[key]['roleId'];
	
	var content = concepts[roleId]['name']+": "+associationNames[associationId]['name'];
	
	content = content + "<div onclick='closeAssociationWindow("+key+")' class='closeAssociationWindow' style='background-color:"+associationNames[associationId]['color']+";'>X</div>";
	
	$("body").append('<div class="window associationWindow associationWindow_'+key+'" style="border:1px solid '+associationNames[associationId]['color']+'; top:'+positionTop+'px; left:'+positionLeft+'px;">'+content+'</div>');
   
	$( function() {
		$( ".window" ).draggable();
	
	});
	
}

//
//	CONCEPT DETAILS
//
function getNodeDetails(key) {
	var position = $('.node_'+key).offset();
	var positionTop = position.top+26;
	var positionLeft = position.left+18;
	
	var title = '<h1>User stories in which the concept <span class="marked" style="background-color:#000000;">'+concepts[key]['name']+'</span> appears</h1>';
	var userStoriesBlock = "";

	userStoriesBlock = "<div>";
	userStoriesBlock = "<div onclick='closeWindow("+key+")' class='closeWindow'>X</div>";
	var userStoriesByRole = [];
	
	for(var i in concepts[key]['user_stories']) {
		var userStoryNumber = concepts[key]['user_stories'][i];
	
		var roleId = userStories[userStoryNumber]['roleId'];
		
		if(userStoriesByRole[roleId] == undefined) {
			userStoriesByRole[roleId] = [];
		}
		
		var means = userStories[userStoryNumber]['meansIndicator']+' '+userStories[userStoryNumber]['meansText']+' ';	
		var ends = userStories[userStoryNumber]['endsIndicator']+' '+userStories[userStoryNumber]['endsText'];
		var userStory = means+ends;
		
		
		
		
		
		
		
		userStory = userStory.replace(concepts[key]['name'].toLowerCase(), "<span class='marked' style='background-color:#000000;'>" + concepts[key]['name'] + "</span>");
		userStory = userStory.replace(concepts[key]['name'], "<span class='marked' style='background-color:#000000;'>" + concepts[key]['name'] + "</span>");		
		
		
					//we check when the user story contains a concept and if so give this concept it's cluster color and make it a link so it can open a new popup window when clicked on
					/*
		for(var j in words2) {
			conceptId = words2[j]['id'];
			if(concepts[conceptId]['type'] != 1) {
				if(concepts[conceptId]['name'] != concepts[key]['name']) {
					userStory = userStory.replace(concepts[conceptId]['name'].toLowerCase(), "<span onClick='getNodeDetails("+conceptId+")' class='node_"+conceptId+" marked markedLink' style='background-color:#1f77b4;'>" + concepts[conceptId]['name'] + "</span>");
					userStory = userStory.replace(concepts[conceptId]['name'].toLowerCase(), "<span onClick='getNodeDetails("+conceptId+")' class='node_"+conceptId+" marked markedLink' style='background-color:#1f77b4;'>" + concepts[conceptId]['name'] + "</span>");
				
				}
			
			}
		
		
		}
		*/
		
		
			//we check when the user story contains an association and if so give this association its color 
		for(var j in associationNames) {
			if(associationNames[j]['name'].length > 2) { //only if the association contains more than 2 characters
				//userStory = userStory.replace(associationNames[j]['name'].toLowerCase(), "<span style='text-transform: lowercase; border-bottom:2px solid "+associationNames[j]['color']+";'>" + associationNames[j]['name'] + "</span>");
				
			}

		}
		
		
		//we check when the user story contains a concept and if so give this concept it's cluster color and make it a link so it can open a new popup window when clicked on
		for(var j in words) {
			conceptId = words[j]['id'];
			if(concepts[conceptId]['type'] != 1) {
				if(concepts[conceptId]['name'] != concepts[key]['name']) {
					if(concepts[conceptId]['name'].length > 2) { //only if the concept contains more than 2 characters
                                            if (concepts[conceptId]['name']!='Color' &&
                                                    concepts[conceptId]['name']!='Style' &&
                                                    concepts[conceptId]['name']!='Round') {
                                                // FIXME: does not work for 'color'
                                                userStory = userStory.replace(concepts[conceptId]['name'].toLowerCase(), "<span onClick='getNodeDetails("+conceptId+")' class='node_"+conceptId+" marked markedLink' style='background-color:#1f77b4;'>" + concepts[conceptId]['name'] + "</span>");
                                                userStory = userStory.replace(concepts[conceptId]['name'].toLowerCase(), "<span onClick='getNodeDetails("+conceptId+")' class='node_"+conceptId+" marked markedLink' style='background-color:#1f77b4;'>" + concepts[conceptId]['name'] + "</span>");
                                            }
					
					}
					
				}
			
			}
		
		
		}
		
		
	
		
		userStoriesByRole[roleId].push(userStory);
			
	}

	for(var i in userStoriesByRole) {
		if(concepts[i] != undefined) {
			userStoriesBlock = userStoriesBlock + "<h2>" + concepts[i]['name'] + "</h2>";
		}
		
		userStoriesBlock = userStoriesBlock + "<ul>";
		
		for(var j in userStoriesByRole[i]) {

		userStoriesBlock = userStoriesBlock + "<li>" +userStoriesByRole[i][j].trim() + ".</li>";
		
		}
		
		userStoriesBlock = userStoriesBlock + "</ul>";

	}

	userStoriesBlock = userStoriesBlock + "</div>";
	
	var content = title+userStoriesBlock;
        console.log(content);
	
   $("#vis").append('<div class="window window_'+key+'" style="top:'+positionTop+'px; left:'+positionLeft+'px;">'+content+'</div>');
   
	$( function() {
		$( ".window" ).draggable();
	
	});

}

/*
$(".node").dblclick(function(){
	var className = $(this).attr("class");
	var key = className.match(/\d+/)[0];

	getNodeDetails(key);

});

$(".nodeText").dblclick(function(){
	var className = $(this).attr("class");
	var key = className.match(/\d+/)[0];

	getNodeDetails(key);

});
*/

function closeWindow(key) {
	$(".window_"+key).css('display', 'none');
}

function closeHelpWindow(key) {
	$(".helpWindow_"+key).css('display', 'none');
}

function closeAssociationWindow(key) {
	$(".associationWindow_"+key).css('display', 'none');
}
//
//	END CONCEPT DETAILS
//



function changeNodeColorsClusterView() {
	var scores = [];
	
	for (var i in conceptContextSimilarityScores) {	
		if(conceptContextSimilarityScores[i].length > 0) {
			var position = [];

			for (var j in conceptContextSimilarityScores) {	
				if(j==i) {
					position.push(1);		
							
				} else {
					if(arrayConceptPairs[i] != undefined){
						if(arrayConceptPairs[i][j] != undefined){
							position.push(arrayConceptPairs[i][j]["contextCosineSimilarityScore"]);
				
						} 
						
					} 

					if(arrayConceptPairs[j] != undefined){
						if(arrayConceptPairs[j][i] != undefined){
							position.push(arrayConceptPairs[j][i]["contextCosineSimilarityScore"]);
									
						}
						
					}
				
				}
		
			}
			
			var objects = {"name":concepts[i]['name'],"position":position};
			
			scores.push(objects);

		}
		
	}

	//
	var scoreCluster = window.scoreCluster = hcluster()
	  .distance('euclidean')
	  .linkage('avg')
	  // .verbose(true)
	  .data(
		scores.sort(function(a,b) { return Math.random() - 0.5 })
	  );

	//


	var clusters = scoreCluster.getClusters(4);
	//console.log(clusters);


	for(var i in concepts) {
		for(var j in clusters) {	
			for(var x in clusters[j]) {	
				if(concepts[i]['name'] == clusters[j][x]['name']) {
					concepts[i]['clusterId'] = j;
				}
			
			}

		}

	}

	for (var i in concepts) {

		//$(".node_"+i).css('fill', '#d62728');
		var color = "";
		if(concepts[i]['clusterId'] != "") { 
			if(concepts[i]['clusterId'] == 0) {
				color = '#ff9c00';
				$(".node_"+i).css('fill', color);	
				$(".node_"+i).css('stroke', color);	
				
			} else if(concepts[i]['clusterId'] == 1) {
				color = '#6a2500';				
				$(".node_"+i).css('fill', color);
				$(".node_"+i).css('stroke', color);
					
			} else if(concepts[i]['clusterId'] == 2) {
				color = '#e377c2';
				$(".node_"+i).css('fill', color);
				$(".node_"+i).css('stroke', color);
					
			} else if(concepts[i]['clusterId'] == 3) {
				color = '#1f77b4';
				$(".node_"+i).css('fill', color);
				$(".node_"+i).css('stroke', color);
					
			} else if(concepts[i]['clusterId'] == 4) {
				color = '#d08900';
				$(".node_"+i).css('fill', color);
				$(".node_"+i).css('stroke', color);
					
			} else if(concepts[i]['clusterId'] == 5) {
				color = '#d000ab';
				$(".node_"+i).css('fill', color);
				$(".node_"+i).css('stroke', color);
					
			} else if(concepts[i]['clusterId'] == 6) {
				color = '#0e5700';
				$(".node_"+i).css('fill', color);
				$(".node_"+i).css('stroke', color);
					
			} else if(concepts[i]['clusterId'] == 7) {
				color = '#e1b3ff';
				$(".node_"+i).css('fill', color);
				$(".node_"+i).css('stroke', color);
					
			} 
			
			concepts[i]['clusterColor'] = color;
		
		}

	}
	
}

function handleConceptClusterDetails(key) {
	for(var i in concepts) {
		$(".node_"+i).removeClass( "nodeShareUserStories" );
		var flag = 0;
		for(var j in concepts[i]['user_stories']) {
			for(var x in concepts[key]['user_stories']) {
				if(concepts[i]['user_stories'][j] == concepts[key]['user_stories'][x]) {
					flag = 1;
					
				}
			
			}
			
		}
		
		if(flag == 1) {
			$(".node_"+i).addClass( "nodeShareUserStories" );
			
		}
		
	}

};


function resetColors() {
	
	if(currentView == 0) {
		$(".viewButton").removeClass( "selectedView" );
		$(".node").removeClass( "nodeClicked" );
		$(".nodeText").removeClass( "nodeTextClicked" );
		
		$("#similarity_view").addClass( "selectedView" );
		
		$(".node").removeClass( "nodeShareUserStories" );

		var roleIds = $('#roleselector').val();
		
		setAmbiguityColor(roleIds);
	
	} else if(currentView == 1) {
		$(".viewButton").removeClass( "selectedView" );
		$(".nodeText").removeClass( "nodeClicked" );
		
		$("#cluster_view").addClass( "selectedView" );
		
		currentView = 1;
		$(".node").removeClass( "nodeShareUserStories" );
		$(".node").removeClass( "nodeTextClicked" );
		$( "#venn_overlay" ).removeClass("venn_overlay_black");
		$( "#playgraph" ).removeClass("positionAbsolute");
		$( ".venn-area" ).css('opacity', '1.0');

		changeNodeColorsClusterView();
			
	}
	
}
	
	