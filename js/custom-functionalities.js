function getConceptIdByName(conceptName) {
	for (var i in concepts) { 
		if(concepts[i]['name'].toLowerCase() == conceptName.toLowerCase()) {
		
			return i;
			
		}
	
	}
		
}

//Parameter i is the ID of the ROLE-CONCEPT
function countConceptsInSet(i) {
	var count = 0;	
	for (var j in concepts) {	
		if(checkConceptIsInRoleConcept(i, j) == 1) {
			count = count + 1;
		
		}
	
	}
		
	return count;

}

function countRoles() {
	var count = 0;
	for(var i in concepts) {
		if(concepts[i]['type'] == 1) {
			count = count + 1;
		
		}
						
	}
	
	return count;
	
}


//Function to check if a roleId is in the SELECTED ROLEIDS
function checkRoleInSelectedRoles(roleId, roleIds) {
	for (var i in roleIds) {
		if(roleId == roleIds[i]) {
			return 1;
			
		}
		
	}
	
	return 0;

}

function getAssociationIdByName(associationName) {
	for (var i in associationNames) {
		if(associationNames[i]['name'] == associationName) {
			return i;
			
		}
	
	}
		
}

function countProperties(obj) {
    var count = 0;

    for (var property in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, property)) {
            count++;
        }
    }

    return count;
}

//
function checkRoleConceptContainsConcepts(roleConceptId) {
	for (var i in concepts) {
		if(concepts[i]['type'] != 1) {
			for(j in concepts[i]['roleIds']) {
				if(concepts[i]['roleIds'][j] == roleConceptId) {
					return 1;
				
				}
			
			}
		
		}
		
	}
	
	return 0;

}


function checkAreasContainConcepts(roleConceptIds) {
	for (var i in concepts) {
		var array = [];
		
		if(concepts[i]['type'] != 1) {
			for(j in concepts[i]['roleIds']) {
				array.push(concepts[i]['roleIds'][j]);
			
				if(arraysEqual(roleConceptIds, array)) {
					return 1;
						
				}
										
			}
		
		}
		
	}
	
	return 0;

}

function countConceptsInArea(roleConceptIds) {
	var count = 0;
	
	for (var i in concepts) {
		var array = [];
		
		if(concepts[i]['type'] != 1) {
			for(j in concepts[i]['roleIds']) {
				array.push(concepts[i]['roleIds'][j]);
			
				if(arraysEqual(roleConceptIds, array)) {
						count = count + 1;
						
				}
										
			}
		
		}
		
	}
	
	return count;

}


//var array = ["0", "6", "68"];


//alert(countConceptsInArea(array));


function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}




//Parameter i is the ID of the ROLE-CONCEPT, Parameter j is the ID of the CONCEPT
function checkConceptIsInRoleConcept(i, j) {
	for (var z in concepts[i]['user_stories']) {		
		for (var x in concepts[j]['user_stories']) {		
			if(concepts[i]['user_stories'][z] == concepts[j]['user_stories'][x]) {
				return 1;

			}
				
		}
					
	}
	
	return 0;

}


function getConceptContext2(conceptId, conceptIdPairB) {
	var conceptContext = "";
	var userStoriesPairs = [];
		for (var i in concepts[conceptId]['user_stories']) {
			//document.write(concepts[conceptId]['name'] + " " + concepts[conceptId]['user_stories'].length +"<br>");
			
			var userStoryNumber = concepts[conceptId]['user_stories'][i];
			
			//document.write(' CONCEPT A: ' + userStoryNumber + ' ');
			
			var flag = 0;
	
			for (var j in concepts[conceptIdPairB]['user_stories']) {
				var userStoryNumberPairB = concepts[conceptIdPairB]['user_stories'][j];
			
				if(userStoryNumber == userStoryNumberPairB) {
					flag = 1;
					//document.write('CONCEPT A ' + concepts[conceptId]['name'] + ' USER STORY NUMBER A ' + userStoryNumber +  ' COMPLETE LIST OF USER STORIES A: ' + concepts[conceptId]['user_stories'] + ' CONCEPT B ' + concepts[conceptIdPairB]['name'] + ' USER STORY NUMBER B ' + userStoryNumberPairB + ' COMPLETE LIST OF USER STORIES B: ' + concepts[conceptIdPairB]['user_stories'] + '<br>');
				
	
				}
			
			}
			
			if(flag == 0) {
					userStoriesPairs[i] = userStoryNumber;
					//document.write('CONCEPT A ' + concepts[conceptId]['name'] + ' ' + 'CONCEPT B ' + concepts[conceptIdPairB]['name'] + ' KOMEN NIET IN ELKEERS CONTEXT VOOR: ' + userStoriesPairs[i] + '<br>');
				
				
			}
			
			

		}
	
		for (var j in userStoriesPairs) {
			var userStoryNumber = userStoriesPairs[j];
			//document.write(concepts[conceptId]['name'] + ' ' + concepts[conceptIdPairB]['name'] + ' ' + userStoriesPairs[j] + '<br>');
			//document.write('<br>');
			//document.write(userStories[9]['role']['indicator'] + " " + userStories[9]['role']['text'] + " " + userStories[9]['means']['indicator'] + " " + userStories[9]['means']['text'] + " " + userStories[9]['ends']['indicator'] + " " + userStories[9]['ends']['text'] + "." + " " + j);
			//document.write(concepts[conceptId]['name'] + ' ' + concepts[conceptIdPairB]['name'] + ' USER STORY NUMBER ' + userStoriesPairs[j] + ' ' + j + '<br><br>');
		
			conceptContext = userStories[userStoryNumber]['roleIndicator'] + " " + userStories[userStoryNumber]['roleText'] + " " + userStories[userStoryNumber]['meansIndicator'] + " " + userStories[userStoryNumber]['meansText'] + " " + userStories[userStoryNumber]['endsIndicator'] + " " + userStories[userStoryNumber]['endsText'] + "." + " " + conceptContext;
			//document.write(concepts[conceptId]['name'] + ' ' + concepts[conceptIdPairB]['name'] + ' USER STORY NUMBER ' + userStoriesPairs[j] + ' ' + conceptContext + '<br><br>');
		}
		
		return conceptContext;
	
}


function getConceptContext(conceptId) {
	var conceptContext = "";
		for (var i in concepts[conceptId]['user_stories']) {
			//document.write(concepts[conceptId]['name'] + " " + concepts[conceptId]['user_stories'].length +"<br>");
			
			var userStoryNumber = concepts[conceptId]['user_stories'][i];

			conceptContext = userStories[userStoryNumber]['roleIndicator'] + " " + userStories[userStoryNumber]['roleText'] + " " + userStories[userStoryNumber]['meansIndicator'] + " " + userStories[userStoryNumber]['meansText'] + " " + userStories[userStoryNumber]['endsIndicator'] + " " + userStories[userStoryNumber]['endsText'] + "." + " " + conceptContext;
		
		}
		
		return conceptContext;
	
}

function getConceptIdByName(conceptName) {
	for (var i in concepts) {
		if(concepts[i]['name'] == conceptName) {
			return i;
			
		}
	
	}
		
}



//
//	FILTER MENU
//
function selectState() {
	$(".node").css('display', 'none');
	$(".nodeText").css('display', 'none');
	$(".associationIcon").css('display', 'none');

	var roleIds = $('#roleselector').val();

	//var card = document.getElementById("conceptstateselector");
	
	var selectedConceptStates = $('#conceptstateselector').val();


	for(var i in concepts) { 	
		var countInViewpoints = 0;
			
		//we check in how many of the SELECTED VIEWPOINTS the concept appears
		for(var x in concepts[i]['roleIds']) { 
			for(var y in roleIds) { 
				if(concepts[i]['roleIds'][x] == roleIds[y]) {
					countInViewpoints = countInViewpoints + 1; 
				
				}
		
			}
		
		}
				
		for(var c in selectedConceptStates) { 
			//if the concept appears in less then the SELECTED NUMBER OF VIEWPOINTS we show the concept if the user SELECTED THE CORRESPONDING STATE
			if (selectedConceptStates[c] == 'corresponding_state') {
				if(countInViewpoints < roleIds.length) {
					$(".node_"+i).css('display', 'block');
					$(".nodeText_"+i).css('display', 'block');
					$(".conceptAssociationIcon_"+i).css('display', 'block');

				} 

			}
			
			//if the concept appears in as many as the SELECTED NUMBER OF VIEWPOINTS we show the concept if the user SELECTED THE CONSENSUS STATE
			if (selectedConceptStates[c] == 'consensus_state') {
				if(countInViewpoints == roleIds.length) {
					$(".node_"+i).css('display', 'block');
					$(".nodeText_"+i).css('display', 'block');
					$(".conceptAssociationIcon_"+i).css('display', 'block');
					
					

				} 

			}
		
		}

	}


}




function selectRole() {
	var roleIds = $('#roleselector').val();
	
	//we empty the svg
	svg = d3.select('svg');
	svg.selectAll("*").remove();
	
	createViewpoints(roleIds)
	
	
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
	
	$(".nodeText").mousedown(function(event) {
		className = $(this).attr("class");
		
		key = className.match(/\d+/)[0];
		
		if(currentView == 0) { // only within the similarity view we can request these details
			handleConceptSimilarityDetails(key);
		
		} else if(currentView == 1) {
			handleConceptClusterDetails(key);
			
		}
		
		$(".node" ).removeClass("nodeClicked");
		$(".node_"+key ).addClass("nodeClicked");
		
		$(".nodeText" ).removeClass("nodeTextClicked");
		$(".nodeText_"+key ).addClass("nodeTextClicked");
		

	});

	$(".node").mousedown(function(event) {
		className = $(this).attr("class");

		key = className.match(/\d+/)[0];

		if(currentView == 0) { // only within the similarity view we can request these details
			handleConceptSimilarityDetails(key);
		
		} else if(currentView == 1) {
			handleConceptClusterDetails(key);
			
		}
		
		$(".node" ).removeClass("nodeClicked");
		$(".node_"+key ).addClass("nodeClicked");
		
		$(".nodeText" ).removeClass("nodeTextClicked");
		$(".nodeText_"+key ).addClass("nodeTextClicked");
	   
	});
	

	
	
	
	
	
	
	var associationSelectOptions = "";

	var uniqueAssociationIds = [];
	for (var i in associations) {
		var associationId = associations[i]['associationId'];

	
	
		
			var conceptId = associations[i]['conceptId'];
			if(concepts[conceptId] != undefined) {
				if(concepts[conceptId]['type'] == 0) {
					
					
					if(uniqueAssociationIds[associationId] == undefined) {
						associationSelectOptions = associationSelectOptions + '<option selected value="'+associationId+'">'+associationNames[associationId]['name']+'</option>';
						
						uniqueAssociationIds[associationId] = associationId;
						
						
						
					}
	
					
			
				}
		
			}
		
		
	

		
	}
		
	$("#associationselector").html(associationSelectOptions);
	
}



//ASSOCIATION RELATIONSHIP FILTER
function selectAssociationRelationship() {

	var associationRelationships = $('#associationselector').val();
	$(".associationIcon").css('display', 'none');
	
	for(i in associationRelationships) {
	
		var key = associationRelationships[i];

		$(".associationIcon_"+key).css('display', 'block');
	
	}

}
//END FILTER MENU

//
//	SIMILARITY VIEW
//
function handleSimilarityColor(key, score) {

	setTimeout(function() {
		//http://stackoverflow.com/questions/12875486/what-is-the-algorithm-to-create-colors-for-a-heatmap
		//http://stackoverflow.com/questions/4161369/html-color-codes-red-to-yellow-to-green
		/*
		var score = (score*1)/0.78;

		var h = (1.0 - score) * 240;
		var val = "hsl(" + h + ", 100%, 50%)";

		$(".node_"+key).css('fill', val);
		*/
		
		score = score*100;
		//if(score >= 0 && score <= 35) {
                if(score >= 0 && score <= 25) {
			$(".node_"+key).css('fill', '#00FF00');
			$(".node_"+key).css('stroke', '#00FF00');

//		} else if(score >= 35 && score <= 40) {
                } else if(score >= 25 && score <= 35) {
			$(".node_"+key).css('fill', '#FFFF00');
			$(".node_"+key).css('stroke', '#FFFF00');
		
//		} else if(score >= 40) {
		} else if(score >= 35) {
			$(".node_"+key).css('fill', '#FF0000');
			$(".node_"+key).css('stroke', '#FF0000');
		
		} 
	
	}, 1);
	
}

 //Function to check if the concept belongs to viewpoint that are selected by the user in the filter menu
 function checkConceptRoleIsInSelectedRoles(conceptId, roleIds) {
	for(y in concepts[conceptId]['roleIds']) {
		for(x in roleIds) {
			if(concepts[conceptId]['roleIds'][y] == roleIds[x]) {
				return 1;
			
			}
		
		}
		
	}
	
	return 0;
 
 }
 
 
  
function setAmbiguityColor(roleIds) {
//IN THE START SCREEN WE COLOR THE NODES BY THEIR SIMILARITY
for(var i in concepts) {
	var inSelectedRoles = checkConceptRoleIsInSelectedRoles(i, roleIds);

	if(inSelectedRoles == 1) {
		 concepts[i]['similarityHighScore'] = 0;
			if(arrayConceptPairs[i] != undefined){
				for (var j in concepts) {
					if(arrayConceptPairs[j] != undefined){
						var flag = 0;
						for(y in concepts[j]['roleIds']) {
							for(x in roleIds) {
								if(concepts[j]['roleIds'][y] == roleIds[x]) {
									flag = 1;
								
								}
							
							}
							
						}
					
						if(flag == 1) {
							if(arrayConceptPairs[i][j] != undefined){
								if(arrayConceptPairs[i][j]['sumCosineSimilarityScore'] > concepts[i]['similarityHighScore']) {
									concepts[i]['similarityHighScore'] = arrayConceptPairs[i][j]['sumCosineSimilarityScore'];
									
									
								}
							
							}

							if(arrayConceptPairs[j][i] != undefined){
								if(arrayConceptPairs[j][i]['sumCosineSimilarityScore'] > concepts[i]['similarityHighScore']) {
									concepts[i]['similarityHighScore'] = arrayConceptPairs[j][i]['sumCosineSimilarityScore'];
								
									
								}
							
							}
							
						}
					
					
					}

				}
			
			}

		}

		if(concepts[i]['similarityHighScore'] != "") {
			handleSimilarityColor(i, concepts[i]['similarityHighScore']);
			
		}

	}
	
}