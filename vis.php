<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/html">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

	<title>REVV-Light</title>
	
	<link href="css/style.css" rel="stylesheet" type="text/css">

	<link href="css/font-awesome.min.css" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css?family=Varela+Round" rel="stylesheet">
	
    <!-- Bootstrap core CSS -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
	
	<link href="css/dropdowns-enhancement.less.css" rel="stylesheet">
	<link href="css/bootstrap-multiselect.css" rel="stylesheet">

    <!-- Custom CSS for the sidebar navigation -->
    <link href="css/sidebar.css" rel="stylesheet">

    <!-- Custom styles for this template -->
    <link href="css/custom.css" rel="stylesheet">
    <link href="css/rangeslider.css" rel="stylesheet">
	
	<!-- We get the JS objects -->
	<script type="text/javascript" src="input/<?php echo htmlspecialchars($_GET["file"], ENT_QUOTES, 'UTF-8'); ?>.js"></script>
	
	<script src="js/jquery-3.1.0.min.js"></script>
	<script type="text/javascript" src="js/custom-functionalities.js"></script>
	
	<link rel="stylesheet" href="css/jquery.range.css">
	<script src="js/jquery.range.js"></script>

  </head>
 
 <body style="overflow:hidden;">

 <div id="resetColors" onclick="resetColors()">Reset colors</div>
 <script>
var words = [];
var words2 = [];
var count = 0;
	
		for(var z in concepts) {
			if(concepts[z]['type'] != 1) {
				countWords = concepts[z]['name'].trim().split(/\s+/).length;

				if(countWords > 1) {
					words2[count] = [];
					words2[count]['id'] = z;
					words2[count]['name'] = concepts[z]['name'];
					words2.push(words2[count]);
					
					count = count + 1;
				}
			
			}
		
		}
	
	var count = 0;
	for(var x in concepts) {
		if(concepts[x]['type'] != 1) {
			countWords = concepts[x]['name'].trim().split(/\s+/).length;
			
			if(countWords == 1) {
				words[count] = [];
				words[count]['id'] = x;
				words[count]['name'] = concepts[x]['name'];
				words.push(words[count]);
				
				count = count + 1;
			
			}
			
		}
		
	}
	</script>
			
<script>
var currentView = 0;
</script>

<!-- A wrapper that wraps all of the content -->
    <div id="wrapper" class="toggled">

<!-- Sidebar -->
		<div id="sidebar-wrapper">

			<ul class="sidebar-nav">
			
			<div style="margin-left:4px; z-index:1000 position:absolute;">
				<span class="fa fa-question-circle helpIcon" id="helpIcon2" style="position:absolute; margin-top:78px; color:#FFFFFF; z-index:9999999999999!important;" onclick="displayHelpWindow(2)"></span>
				<!-- <span class="fa fa-question-circle helpIcon" id="helpIcon3" style="position:absolute; margin-top:119px; color:#FFFFFF; z-index:9999999999999!important;" onclick="displayHelpWindow(3)"></span> -->
			</div>
			
			<li class="sidebar-brand">
				<a id="" href="#">REVV-Light</a>			
			</li>
			<li>
				<a id="similarity_view" class="viewButton selectedView" href="#">Similarity view</a>
				<!-- <a id="cluster_view" class="viewButton" href="#">Cluster view</a> -->					
			</li>
				
			<li>
			  <select id="roleselector" multiple="multiple" onchange="selectRole()">
				<script>								
				var j =0;	
				for(var i in concepts) {

					if(concepts[i]['type'] == 1) {
						var selected = "";
						if(j < 3) {
							selected =  'selected="selected"';
						
							j = j + 1;
				
						}
									
						document.write('<option value="'+i+'" '+selected+'>'+concepts[i]['name']+'</option>');
					}
					
				}
				</script>
			  </select>		
			</li>
						
			<li id="relationshipli">
			  <select id="associationselector" multiple="multiple" onchange="selectAssociationRelationship()">
					<script>
				
					</script>
			

			  </select>
			</li>
				
<!--			<li id="conceptstateli">
			  <select id="conceptstateselector" multiple="multiple" onchange="selectState()">
				  <option value="consensus_state" selected="selected">Consensus/Conflict</option>
				  <option value="corresponding_state" selected="selected">Corresponding/Contrast</option>

			  </select>
			</li>-->

			<li id="ambiguityrange">
				<span class="hide-native-select">				  
					<div class="btn-group"><button type="button" class="multiselect dropdown-toggle btn btn-default" data-toggle="dropdown" title="Ambiguity Range"><span class="multiselect-selected-text">Ambiguity Range</span> <b class="caret"></b><span class="multiselect_icon sub_icon fa fa-arrows-h" aria-hidden="true"></span></button>
						<ul class="multiselect-container dropdown-menu" style="width:240px; background-color:#1a1a1c; max-height: 400px; overflow-y: auto; overflow-x: hidden;">
						  
							<li class="multiselect-item multiselect-all active" style="margin-left:20px; background: rgb(243, 243, 243) none repeat scroll 0% 0%;">
								<a style="background-color:#1a1a1c; margin-top:30px; padding-bottom:30px;" tabindex="0" class="multiselect-all"><input name="slideValue" onchange="handleAmbiguityRange()" type="hidden" class="range-slider" value="23" /></a>
							</li>					
						</ul>			
					</div>
				</span>
			</li>
			
			<li>
				<a id="user_stories" onclick="showAllStories()" href="#">User Stories</a>
			</li>
				
			<script>
			$('.range-slider').jRange({
				from: 0,
				to: 1,
				step: 0.01,
				scale: [0.00,0.25,0.50,0.75,1.00],
				format: '%s',
				width: 180,
				showLabels: true,
				theme: 'theme-blue',
				isRange : true
			});

			function handleAmbiguityRange() {
				var val = $('input[name=slideValue]').val();
				
				var valMin = val.substr(0, val.indexOf(',')); 
				var valMax = val.substr(val.indexOf(",") + 1);
				
	
				$(".node").css('display', 'none');
				$(".associationIcon").css('display', 'none');
				$(".nodeText").css('display', 'none');
				
				for(var i in concepts) {
					if(concepts[i]['similarityHighScore'] <= valMax && concepts[i]['similarityHighScore'] >= valMin) {
						$(".node_"+i).css('display', 'block');
						$(".conceptAssociationIcon_"+i).css('display', 'block');
						$(".nodeText_"+i).css('display', 'block');
	
					}
				
				}

			}
			</script>
			
			</ul> <!-- End .sidebar-nav-->
		</div><!-- End #sidebar-wrapper -->

		<div id="vis" style="border:5px solid #1a1a1c; background-color:#f8f8f8;"> 
			<div id="venn_overlay"></div>
			<svg id="venn"></svg>
		</div>
	
	</div><!--End #wrapper -->

 <!-- JAVASCRIPT FILES -->
<script src="js/d3.v3.min.js"></script>
<script src="js/d3-venn.js" type="text/javascript"></script>

<script> 
//Called when drag event starts. It stop the propagation of the click event
function dragstarted(d){
	d3.event.sourceEvent.stopPropagation();
}

//Called when the drag event occurs (object should be moved)
function dragged(d){
	d.x = d3.event.x;
	d.y = d3.event.y;
	//Translate the object on the actual moved point
	d3.select(this).attr({
		transform: "translate(" + d.x + "," + d.y + ")"
	});
}
</script>

<script src="js/hcluster.js"></script>

<!-- Placed at the end of the document so the pages load faster -->
<script src="js/jquery-ui.min.js"></script>

<script>
<!-- https://material.io/guidelines/style/color.html#color-color-palette -->
colors = ['#D50000', '#C51162', '#4A148C', '#311B92', '#1A237E', '#0D47A1', '#01579B', '#006064', '#004D40', '#1B5E20', '#33691E', '#827717', '#F57F17', '#FF6F00', '#E65100', '#BF360C', '#3E2723', '#212121', '#263238', '#000000']

var countAssociationNames = countProperties(associationNames);

var j = 0;
for(var i=0; i < countAssociationNames; i++) {
	if(j >= colors.length) {
		j = 0;
		
	}

	associationNames[i]['color'] = colors[j];
	
	j = j+1;

}

</script>

<script src="script.js" type="text/javascript"></script>
<script>
selectRole();
</script>

<!--<script>window.jQuery || document.write('<script src="../../assets/js/vendor/jquery.min.js"><\/script>')</script>-->

<!-- Bootstrap Javascript files -->
<script src="js/bootstrap.min.js"></script>
<!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
<!-- <script src="assets/js/ie10-viewport-bug-workaround.js"></script> -->

<!-- Include the Javascript for the dropdown enhancer-->
<script src="js/dropdowns-enhancement.js"></script>

<!--Inlcude the Javascript for the zoom scrollbar-->
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/7.0.0/bootstrap-slider.js"></script>

<!-- Load the JS for the bootstrap-select plugin -->
<script type="text/javascript" src="js/bootstrap-multiselect.js"></script>

<!-- Initialize the multiselect plugin and apply our own settings: -->
<script type="text/javascript" src="js/multiselect-vn.js"></script>

<!-- Load theJS to hide Header on on scroll down -->
<script type="text/javascript" src="js/header-bar-vn.js"></script>

<script type="text/javascript" src="js/sidebar-vn.js"></script>

<!-- Open the sidebar menu when clicking the hamburger/a element up top -->
<script>
	$("#menu-toggle").click(function(e) {
		e.preventDefault();
		// e.defaultPrevented();
		$("#wrapper").toggleClass("toggled");
	});
 </script>

 <!-- Javascript to open/close the horizontal header-bar -->
 <script>
  //   $("#topbar-button-a").click(function(e){
  //     if $("header").hasClass("nav-down")){
  //     $("header").removeClass("nav-down").addClass("nav-up");
  //   }
  //    else{
   //
  //     if ($("header").hasClass("nav-up")) {
  //      $("header").removeClass("nav-up").addClass("nav-down");
  //    }
  //  }
  //   });
  $("#topbar-button-a").click(function(e) {
	  e.preventDefault();
	  $("header").toggleClass("nav-up");
  });

 </script>
 <script>
var HttpClient = function() {
	this.get = function(aUrl, aCallback) {
		var anHttpRequest = new XMLHttpRequest();
		anHttpRequest.onreadystatechange = function() {
			if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
				aCallback(anHttpRequest.responseText);
		}

		anHttpRequest.open( "GET", aUrl, true );
		anHttpRequest.send( null );
	}
}

aClient = new HttpClient();
aClient.get('127.0.0.1:5000', function(response) {
	console.log(response)// do something with response
});

console.log(concepts);
console.log(userStories);
console.log(associationNames);
console.log(associations);
console.log(arrayConceptPairs);

 </script>
	 
<script type="text/javascript" src="js/custom-js.js"></script>

<div id="backlog_2">
<a id="close_backlog_button_2" class="backlog_button">Close backlog</a>
<script>
document.write("<table>");
	document.write("<tr>");
		document.write("<td>");
			document.write("Concept A");
		document.write("</td>");
		document.write("<td>");
			document.write("Concept B");
		document.write("</td>");
		document.write("<td>");
			document.write("Concept Cosine Similarity Score");
		document.write("</td>");
		document.write("<td>");
			document.write("Context Cosine Similarity Score");
		document.write("</td>");
		document.write("<td>");
			document.write("Sum Similarity Score");
		document.write("</td>");
		document.write("<td>");
			document.write("Context Concept A");
		document.write("</td>");
		document.write("<td>");
			document.write("Context Concept B");
		document.write("</td>");
	document.write("</tr>");
	

arrayConceptPairsCount = arrayConceptPairs.length;

for (var i in arrayConceptPairs) {
	
	
		var x= 0;
	for (var j in arrayConceptPairs[i]) {
		var contextConceptAWithoutShared = getConceptContext2(i, j);
		var contextConceptBWithoutShared = getConceptContext2(j, i);
			document.write("<tr>")
		document.write("<td>")
			document.write(concepts[i]['name']);
		document.write("</td>")

			document.write("<td>")
				document.write(concepts[j]['name']);
			document.write("</td>")
	
		
		document.write("<td>")
			document.write(arrayConceptPairs[i][j]['conceptCosineSimilarityScore']);
		document.write("</td>")
		document.write("<td>")
			document.write(arrayConceptPairs[i][j]['contextWithoutSharedCosineSimilarityScore']);
		document.write("</td>")
		
			document.write("<td>")
			document.write(arrayConceptPairs[i][j]["sumCosineSimilarityScore"]);
		document.write("</td>")
		
		document.write("<td>")
			document.write(contextConceptAWithoutShared);
		document.write("</td>")
		document.write("<td>")
			document.write(contextConceptBWithoutShared);
		document.write("</td>")
		
			document.write("</tr>")
	}

}

document.write("</table>");
</script>

</div>

<div id="backlog">
<a id="close_backlog_button_1" class="backlog_button">Close backlog</a>

<script>

document.write("<table>");

document.write("<tr>");
document.write("<td></td>");

for (var i in conceptContextSimilarityScores) {	
	if(conceptContextSimilarityScores[i].length > 0) {
		document.write("<td>");
			document.write(concepts[i]['name']);
		document.write("</td>");
	}
}

document.write("</tr>");

for (var i in conceptContextSimilarityScores) {	
        
	if(conceptContextSimilarityScores[i].length > 0) {
	document.write("<tr>");
		document.write("<td>");
			document.write(concepts[i]['name']);
		document.write("</td>");
		
		
		for (var j in conceptContextSimilarityScores) {	
			if(j==i) {
				document.write("<td>");
				document.write("1");
				document.write("</td>");
						
			} else {
				
				if(arrayConceptPairs[i] != undefined){
					if(arrayConceptPairs[i][j] != undefined){
						document.write("<td>");
						document.write(arrayConceptPairs[i][j]["contextCosineSimilarityScore"]);
						document.write("</td>");
								
					} 
					
				} 

				if(arrayConceptPairs[j] != undefined){
					if(arrayConceptPairs[j][i] != undefined){
						document.write("<td>");
						document.write(arrayConceptPairs[j][i]["contextCosineSimilarityScore"]);
						document.write("</td>");
								
					}
					
				}                               
			
			}
	
			
		}
		

	document.write("</tr>");
	}
}

document.write("</table>");

</script>

<script>
$("#similarity_view").click(function() {
	currentView = 0;
	$(".viewButton").removeClass( "selectedView" );
	$(".node").removeClass( "nodeClicked" );
	$(".nodeText").removeClass( "nodeTextClicked" );

	
	$("#similarity_view").addClass( "selectedView" );
	
	$(".node").removeClass( "nodeShareUserStories" );
	
	var roleIds = $('#roleselector').val();
	
	setAmbiguityColor(roleIds);

});


function handleConceptSimilarityDetails(key) {
	if(arrayConceptPairs[key] != undefined){
		for(var i in arrayConceptPairs) {
			if(arrayConceptPairs[key][i] != undefined){
				handleSimilarityColor(i, arrayConceptPairs[key][i]["sumCosineSimilarityScore"])

			}
		
		}
		
	}
					
	for(var i in arrayConceptPairs) {
		if(arrayConceptPairs[i] != undefined){
			if(arrayConceptPairs[i][key] != undefined){
				handleSimilarityColor(i, arrayConceptPairs[i][key]["sumCosineSimilarityScore"])
	
			}
			
		}
		
	}

};



</script>

</div>	

<script>
$("#backlog_button").click(function() {
	$("#wrapper").css('display', 'none');
	$("#backlog").css('display', 'block');
});

	
$("#close_backlog_button_1").click(function() {
	$("#wrapper").css('display', 'block');
	$("#backlog").css('display', 'none');
});
	
$("#backlog_button_2").click(function() {
	$("#wrapper").css('display', 'none');
	$("#backlog_2").css('display', 'block');
});

$("#close_backlog_button_2").click(function() {
	$("#wrapper").css('display', 'block');
	$("#backlog_2").css('display', 'none');
});
</script>

</body>
	  
</html>