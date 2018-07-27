<script src="js/jquery-3.1.0.min.js"></script>
<script type="text/javascript" src="js/custom-functionalities.js"></script>
<script type="text/javascript" src="js/retina-sdk.js"></script>
<!--
THIS FILE TAKES THE CREATED REPORT FILE FROM THE VISUAL NARRATOR AS INPUT.
THIS FILE EXTRACTS THE DATA WE NEED AND SAVES IT INTO A JAVASCRIPT OBJECT.
THIS OBJECT IS SAVED IN A JAVASCRIPT FILE IN THE 'INPUT' MAP.
-->
<?php
$info = pathinfo($_FILES['file-1']['name']);

$ext = $info['extension']; // get the extension of the file
$filename = pathinfo($_FILES['file-1']['name'], PATHINFO_FILENAME);

$randomCharacters = substr(md5(microtime()), rand(0, 26), 5);

$newname = $filename . '-' . $randomCharacters;
$newnameWithExtension = $newname . '.' . $ext;

if ($ext != "html") {
    die("The uploaded file has a '" . $ext . "' extension. Please make sure you upload a file with a .html extension.");
} else {
    echo "Thank you for uploading your file. You can view the visualization by following the link below once the browser is done loading (please note this may take up to 5 minutes):<br>";
    echo "<a href='vis.php?file=" . $newname . "'><b>" . $newname . "</b></a>";
   
}


$target = 'reports/' . $newnameWithExtension;
move_uploaded_file($_FILES['file-1']['tmp_name'], $target);
?>

<script>
var fileName = "<?php echo $newname; ?>";
</script>

<div style="display:none;">
    <?php
    include('reports/' . $newnameWithExtension . '');
    ?>
</div>



<script>
//COMMON FUNCTIONS

//THIS FUNCTION REMOVES THE USER STORIES FROM A PARENT CONCEPT IF THEY ARE SHARED WITH A CHILD CONCEPT
function removeSameUserStories(parentConcept, childConcept) {
        parentId = getConceptIdByName(parentConcept);
        childId = getConceptIdByName(childConcept);
	
        for(var i in concepts[childId]['user_stories']) {
                var userStoryIdChildConcept = concepts[childId]['user_stories'][i];
		
                if(concepts[parentId] != undefined) {
                        if(concepts[parentId]['type'] != 1) {
                                for(var j in concepts[parentId]['user_stories']) {
                                        var userStoryIdParentConcept = concepts[parentId]['user_stories'][j];

                                        if(userStoryIdChildConcept == userStoryIdParentConcept) { //we check if the parent and child concepts share user stories, if so we remove it from the parent
                                                //concepts[parentId]['user_stories'].splice(j, 1); //we remove the user story from the parent concept 
                                                delete concepts[parentId]['user_stories'][j];

                                        }
								
                                }
						
                                if(countProperties(concepts[parentId]['user_stories']) == 0) {
                                        delete concepts[parentId];
					
                                }
			
                        }
			
                }
			
        }
												
}
	
//THIS FUNCTION CHECKS IF AN ASSOCIATION RELATIONSHIP EXISTS
function checkAssociationExists(predicate) {
        flag = 0;
	
        for (var i in associationNames) {
                if(associationNames[i]['name'] == predicate) {
                        flag = 1;
			
                }
	
        }
	
        if(flag == 1) {
                return true;
        } else {
                return false
        }
		
}

//
//WE PREPARE THE OBJECTS WE USE TO SAVE THE DATA IN
//
var concepts = {};
var associations = {};
var associationNames = {};
var userStories = {};

//
//WE EXTRACT THE DATA FROM THE REPORT FILE AND PUT IT IN THE OBJECTS
//


//	1. WE EXTRACT THE CONCEPTS
var table = $("#classes");

var count = 0;
table.find('tr').each(function (i) {
        var $tds = $(this).find('td'),
                type = $tds.eq(0).text(),
                name = $tds.eq(1).text(),
                parent = $tds.eq(2).text();
                occursIn = $tds.eq(3).text();
		
                occursIn = occursIn.replace(/ /g , "");
		
        if(name != "") {	
                //WE EXTRACT ALL THE CONCEPTS

                concepts[count] = {};
                concepts[count].name = name;		
                concepts[count].user_stories = {};
                concepts[count].roleIds = {};

                concepts[count].similarityHighScore = "";
                concepts[count].clusterId = "";

                var arr = occursIn.split(',');
                for(var j in arr) {
                        concepts[count].user_stories[j] = arr[j];
			
                }
		
                //WE EXTRACT ALL THE ROLES
                if(type == "FunctionalRole") {
                        concepts[count].type = 1;
			
                } else {
                        concepts[count].type = 0;
			
                }
		
		
                count = count + 1;
	
        }

});

//
//	2. WE EXTRACT ALL THE USER STORIES
//
var body = $("body");

body.find('.user-story').each(function (i) {
        var $spanUserStoryId = $(this).find('.label-success');
        var userStoryId = $spanUserStoryId.eq(0).text();
	
        userStoryId = userStoryId.replace( /^\D+/g, '');
	
        var $spanRoleIndicator = $(this).find('.roleIndicator');
        var $spanMeansIndicator = $(this).find('.meansIndicator');
        var $spanEndsIndicator = $(this).find('.endsIndicator');
	
        var $spanRoleText = $(this).find('.roleText');
        var $spanMeansText = $(this).find('.meansText');
        var $spanEndsText = $(this).find('.endsText');
	
        var roleIndicator = $spanRoleIndicator.eq(0).text();
        var meansIndicator = $spanMeansIndicator.eq(0).text();
        var endsIndicator = $spanEndsIndicator.eq(0).text();

        var roleText = $spanRoleText.eq(0).text().trim();
        var meansText = $spanMeansText.eq(0).text().trim();
        var endsText = $spanEndsText.eq(0).text().trim();

        //we make sure the user story is not a duplicate
        var duplicate = 0;
        for(var j in userStories) {
		
                var userStoryA = userStories[j]['roleText']+userStories[j]['meansText']+userStories[j]['endsText'];
                var userStoryB = roleText+meansText+endsText;
		
                if(userStoryA == userStoryB) {
		
                        for(var x in concepts) {
                                for(var z in concepts[x]['user_stories']) {
                                        if(concepts[x]['user_stories'][z] == userStoryId) {
                                                var duplicate = 1;
                                                delete concepts[x]['user_stories'][z];

                                        }
				
                                }
			
				
                        }

                } else {
                        meansText = meansText.replace("I can ", ""); 	

                        userStories[userStoryId] = {};
			
                        userStories[userStoryId]['roleIndicator'] = roleIndicator;
                        userStories[userStoryId]['meansIndicator'] = meansIndicator;
                        userStories[userStoryId]['endsIndicator'] = endsIndicator;
			
                        userStories[userStoryId]['roleText'] = roleText;
                        userStories[userStoryId]['meansText'] = meansText;
                        userStories[userStoryId]['endsText'] = endsText;
		
			
                }
	
        }
	
        meansText = meansText.replace("I can ", ""); 	

        userStories[userStoryId] = {};
	
        userStories[userStoryId]['roleIndicator'] = roleIndicator;
        userStories[userStoryId]['meansIndicator'] = meansIndicator;
        userStories[userStoryId]['endsIndicator'] = endsIndicator;
	
        userStories[userStoryId]['roleText'] = roleText;
        userStories[userStoryId]['meansText'] = meansText;
        userStories[userStoryId]['endsText'] = endsText;

        if(duplicate == 1) {
                delete userStories[userStoryId];
						
        }

});



//	3. WE EXTRACT ALL ASSOCIATION RELATIONSHIPS.
//	WE REMOVE ALL PARENT CONCEPTS FROM CHILD CONCEPTS SINCE WE DO NOT NEED THOSE
var table = $("#relationships");
var arr = [];

table.find('tr').each(function (i) {
        var $tds = $(this).find('td'),
                subject = $tds.eq(0).text(),
                predicate = $tds.eq(1).text(),
                object = $tds.eq(2).text();
                occursIn = $tds.eq(3).text();
		
                occursIn = occursIn.replace(/ /g , "");
		
        if(predicate == "isa") { //isa relationships
                removeSameUserStories(object, subject);
		
        } else if(subject + " " + predicate == object) { //has a relationships
                removeSameUserStories(subject, object);
		
        } else { //association relationships
                var roleId = getConceptIdByName(subject);
                var conceptId = getConceptIdByName(object);
		
                if(roleId != undefined) {
                        //IF THE ASSOCIATION RELATIONSHIP DOES NOT EXIST YET IN THE ASSOCIATION OBJECT WE ADD IT.
                        if(checkAssociationExists(predicate) == false) {
                                var count = countProperties(associationNames);
				
                                associationNames[count] = {};
                                associationNames[count].name = predicate;

                        }
                        //WE ADD THE ASSOCIATION RELATIONSHIP ID IN THE ASSOCIATIONS OBJECT
                        associationId = getAssociationIdByName(predicate);
				
                        var count = countProperties(associations);
				
                        associations[count] = {};
                        associations[count].associationId = associationId;
                        associations[count].roleId = roleId;
                        associations[count].conceptId = conceptId;
			
                        associations[count].user_stories = {};
			
                        var arr = occursIn.split(',');
                        for(var j in arr) {
                                associations[count].user_stories[j] = arr[j];
			
                        }

                }
		
        }

});

for (var i in concepts) {
        for (var j in concepts[i]['user_stories']) {
                userStoryId = concepts[i]['user_stories'][j];

        }
	
}

//WE CHECK WHAT CONCEPTS SHARE USER STORIES WITH WHAT ROLES
for (var i in concepts) {			
        if(concepts[i]['type'] == 1) { //ROLE CONCEPT	
	
	
                for (var j in concepts) {
                var flag = 0;
                        for (var x in concepts[i]['user_stories']) { 
                                for (var z in concepts[j]['user_stories']) { 

                                        if(concepts[j]['name'] == "Text") {
                                                //document.write(concepts[i]['name']+"<br>");
                                                //document.write(concepts[j]['name']+"<br>");
                                                //document.write(concepts[j]['user_stories'][z]);
                                        }
				
                                        if(concepts[i]['user_stories'][x] == concepts[j]['user_stories'][z]) {	
					
                                                userStoryId = concepts[i]['user_stories'][x];						
						
						
                                                //var str = userStories[userStoryId]['roleText'].toLowerCase();
                                                //var n = str.includes(concepts[i]['name'].toLowerCase());
							

						
                                                if(userStories[userStoryId]['roleText'].toLowerCase() == concepts[i]['name'].toLowerCase()) {
						
						
									
						
                                                        if(flag == 0) { 							
                                                                var count = countProperties(concepts[j]['roleIds']);
                                                                concepts[j]['roleIds'][count] = i;
								
                                                                flag = 1;
							
                                                        }
			
                                                }

                                        }
				
                                }
			
                        }

                }

        }
	
}

//function from the custom-functionalities.js file.. 
function getConceptIdByName(conceptName) {
        for (var i in concepts) { 
                if(concepts[i]['name'].toLowerCase() == conceptName.toLowerCase()) {
		
                        return i;
			
                }
	
        }
		
}


//checks whether two concepts appear in different roles
function conceptsInDifferentRoles(conceptA, conceptB) {
    for (var i in conceptA["roleIds"]) {
        var found = false;
        for (var j in conceptB["roleIds"]) {
            if (conceptA["roleIds"][i]===conceptB["roleIds"][j]) {
                found=true;
                break;
            }
        }
        if (found===false)
            return true;
    }
    
    for (var i in conceptB["roleIds"]) {
        var found = false;
        for (var j in conceptA["roleIds"]) {
            if (conceptB["roleIds"][i]===conceptA["roleIds"][j]) {
                found=true;
                break;
            }
        }
        if (found===false)
            return true;
    }    
    
    return false;
    
}

//ADD ROLE ID IN EACH USER STORY
for(var i in userStories) {
        var roleName = userStories[i]['roleText'];
	
        var roleId = getConceptIdByName(roleName);
	
        userStories[i]['roleId'] = roleId;
	
}

//
//	4. WE CALCULATE THE SIMILARITY AND RELATEDNESS SCORES
//
var arrayConceptPairs = {};

var similarTerms = {};


//WE GET THE SIMILARITY contextCosineSimilarityScore AND SAVE IT IN THE concepts contextCosineSimilarityScore FIELD

/* var fC = retinaSDK.FullClient("cd8a64e0-6833-11e8-917d-b5028d671452", "http://api.cortical.io/rest/", "en_synonymous");

for (var i in concepts) {
        var list = fC.getSimilarTermsForTerm(concepts[i]["name"]);
        if (list!=null)
                if (list[1]!=null)
                        console.log(concepts[i]["name"] + " - " + list[1]["term"]);
}

exit; */
    
//var oldConcept;
//for (var i in concepts) {
//    console.log("=== Concept " + concepts[i]["name"] + " - " + concepts[i]["type"]);
//    for (var k=0; k<countProperties(concepts[i]["roleIds"]);k++) {
//        console.log(concepts[i]["roleIds"][k]);
//    }
//    if (i>0 && conceptsInDifferentRoles(concepts[i], oldConcept))
//        console.log("CIDR(" + concepts[i]["name"] + "," + oldConcept["name"] + ")");
//    oldConcept = concepts[i];
//
//}

var counter = 0;
for (var i in concepts) {
        counter++;
        console.log("Am at concept " + counter + " out of " + countProperties(concepts));
        if(countProperties(concepts[i]['user_stories']) > 0) {
                if(concepts[i]['type'] != 1) { //we only need to get the similarity score of non-actor concepts
                        arrayConceptPairs[i] = {};

                        var j = 0; //MATRIX
                        for (var j in concepts) {
                                if(j>i) { //MATRIX
                                        if(countProperties(concepts[j]['user_stories']) > 0) {
                                                var contextConceptA = getConceptContext(i); //THE ENTIRE CONTEXT OF CONCEPT A
                                                var contextConceptAWithoutShared = getConceptContext2(i,j); //THE CONTEXT OF CONCEPT A WITHOUT USER STORIES THAT APPEAR IN THE CONTEXT OF CONCEPT B

                                                if(concepts[j]['type'] != 1) { //we only need to get the similarity score of non-actor concepts
                                                        arrayConceptPairs[i][j] = {};
                                                        arrayConceptPairs[i][j]["conceptCosineSimilarityScore"] = 0;
                                                        arrayConceptPairs[i][j]["contextCosineSimilarityScore"] = 0;
                                                        arrayConceptPairs[i][j]["contextWithoutSharedCosineSimilarityScore"] = 0;
                                                        arrayConceptPairs[i][j]["sumCosineSimilarityScore"] = 0;
                                                        if(concepts[i]["name"] != concepts[j]["name"] && conceptsInDifferentRoles(concepts[i],concepts[j])) { //we filter out pairs of the same concept
                                                                var contextConceptB = getConceptContext(j); //THE ENTIRE CONTEXT OF CONCEPT B
                                                                var contextConceptBWithoutShared = getConceptContext2(j,i); //THE CONTEXT OF CONCEPT B WITHOUT USER STORIES THAT APPEAR IN THE CONTEXT OF CONCEPT A
                                                                

                                                                //	WE CALCULATE THE CONCEPT COSINE SIMILARITY SCORE

                                                                // Create FullClient instance with explicit server address and Retina name 
                                                                //var fullClient = retinaSDK.FullClient("c604cb40-a73f-11e6-a057-97f4c970893c", "http://api.cortical.io/rest/", "en_synonymous");
                                                                var fullClient = retinaSDK.FullClient("cd8a64e0-6833-11e8-917d-b5028d671452", "http://api.cortical.io/rest/", "en_synonymous");

                                                                // Make multiple comparisons in a single call 
                                                                var callback = "";
									
                                                                comparisons = [];
                                                                comparisons.push([{"text": concepts[i]["name"]}, {"text": concepts[j]["name"]}]);
								
                                                                var resultConceptSimilarityScore = fullClient.compareBulk({comparisons}, callback);
								
                                                                //
                                                                var numberOfWords = concepts[i]["name"].split(" ").length + concepts[j]["name"].split(" ").length;
                                                                if(numberOfWords > 2) {
                                                                        var division = 2;
								
                                                                        resultConceptSimilarityScore[0].cosineSimilarity = resultConceptSimilarityScore[0].cosineSimilarity / division;
								
                                                                }

                                                                arrayConceptPairs[i][j]["conceptCosineSimilarityScore"] = resultConceptSimilarityScore[0].cosineSimilarity;

								
                                                                //	WE CALCULATE THE CONTEXT COSINE SIMILARITY SCORE WITH SHARED USER STORIES (FOR CLUSTERING)
                                                                /*if(contextConceptB != "" && contextConceptA != "") {  //we only want concepts that have a context (user stories)
									
									
										
									
                                                                        // Create FullClient instance with explicit server address and Retina name 
                                                                        var fullClient = retinaSDK.FullClient("c604cb40-a73f-11e6-a057-97f4c970893c", "http://api.cortical.io/rest/", "en_associative");

                                                                        // Make multiple comparisons in a single call
                                                                        var callback = "";
									
                                                                        comparisons = [];
                                                                        comparisons.push([{"text": contextConceptA}, {"text": contextConceptB}]);
								
									
                                                                        var resultContextCosineSimilarityScore = fullClient.compareBulk({comparisons}, callback);

                                                                } 
								
                                                                if(resultContextCosineSimilarityScore[0].cosineSimilarity != undefined) {
                                                                        arrayConceptPairs[i][j]["contextCosineSimilarityScore"] = resultContextCosineSimilarityScore[0].cosineSimilarity;
								
                                                                } else {
                                                                        arrayConceptPairs[i][j]["contextCosineSimilarityScore"] = 0;
									
                                                                }*/
								
                                                                arrayConceptPairs[i][j]["contextCosineSimilarityScore"] = 0;
								
                                                                //	WE CALCULATE THE CONTEXT COSINE SIMILARITY SCORE WITHOUT SHARED USER STORIES (FOR SIMILARITY)
                                                                if(contextConceptAWithoutShared != "" && contextConceptBWithoutShared != "") {  //we only want concepts that have a context (user stories)

                                                                // Create FullClient instance with explicit server address and Retina name 
                                                                var fullClient = retinaSDK.FullClient("cd8a64e0-6833-11e8-917d-b5028d671452", "http://api.cortical.io/rest/", "en_associative");

                                                                // Make multiple comparisons in a single call
                                                                var callback = "";
								
                                                                comparisons = [];
                                                                comparisons.push([{"text": contextConceptAWithoutShared}, {"text": contextConceptBWithoutShared}]);
							
								
                                                                var resultContextWithoutSharedCosineSimilarityScore = fullClient.compareBulk({comparisons}, callback);

                                                                } 
								
                                                                if(resultContextWithoutSharedCosineSimilarityScore != undefined) {
                                                                        arrayConceptPairs[i][j]["contextWithoutSharedCosineSimilarityScore"] = resultContextWithoutSharedCosineSimilarityScore[0].cosineSimilarity;
								
                                                                } else {
                                                                        arrayConceptPairs[i][j]["contextWithoutSharedCosineSimilarityScore"] = 0;
									
                                                                }

                                                                //	WE ADD THE SCORES
								 
                                                                var sum = arrayConceptPairs[i][j]["contextWithoutSharedCosineSimilarityScore"]*1 + arrayConceptPairs[i][j]["conceptCosineSimilarityScore"]*2;
                                                                //var sum = concepts[i]["conceptCosineSimilarityScore"][j];
								
                                                                arrayConceptPairs[i][j]["sumCosineSimilarityScore"] = sum/3;
							
                                                        }
                                                        // ADDED BY FD else arrayConceptPairs[i][j]["sumCosineSimilarityScore"] = 0;
							
                                                }

                                        }
							
                                }
	
                        }
	
                }
		
        }	

}

for (var i in arrayConceptPairs) {

        if(concepts[i] != undefined) {
                concepts[i]['similarityHighScore'] = 0;

                for (var j in arrayConceptPairs) {
                        if(arrayConceptPairs[i] != undefined){
                                if(arrayConceptPairs[i][j] != undefined){
                                        if(arrayConceptPairs[i][j]["sumCosineSimilarityScore"] > concepts[i]['similarityHighScore']) {
                                                concepts[i]['similarityHighScore'] = arrayConceptPairs[i][j]["sumCosineSimilarityScore"];

                                        }
				 
                                } else if(arrayConceptPairs[j] != undefined){
                                        if(arrayConceptPairs[j][i] != undefined){
                                                if(arrayConceptPairs[j][i]["sumCosineSimilarityScore"] > concepts[i]['similarityHighScore']) {
                                                        concepts[i]['similarityHighScore'] = arrayConceptPairs[j][i]["sumCosineSimilarityScore"];

                                                }
				
                                        }
				
                                }

                        }

                }

        }

}

//END CALCULATING SCORES

var send = $.ajax({
   url: 'process-data.php',
   type: 'post',
   data: {"concepts" : JSON.stringify(concepts), "userStories" : JSON.stringify(userStories), "associationNames" : JSON.stringify(associationNames), "associations" : JSON.stringify(associations), "arrayConceptPairs" : JSON.stringify(arrayConceptPairs), "fileName" : fileName},
   success: function(data) {
        // Do something with data that came back. 
   }
});
</script>
