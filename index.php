<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/html">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

	<title>REVV Light</title>
	
	<link href="css/style.css" rel="stylesheet" type="text/css">
	<link href="css/bootstrap.min.css" rel="stylesheet">

	<link href="css/font-awesome.min.css" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css?family=Varela+Round" rel="stylesheet">
	
	
	<script src="js/jquery-3.1.0.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	
	<script type="text/javascript" src="js/custom-functionalities.js"></script>
	<script type="text/javascript" src="js/custom-js.js"></script>
	<script type="text/javascript" src="js/jquery-ui.min.js"></script>
	
	
	
	
	
  </head>
 

 
 <body>
	<div id="title_container"><h1>REVV Light</h1></div>
	
               
	<div id="upload_container">
		<h2>Upload your file<span style="font-size:16px; position:absolute; margin-top:0px;" class="fa fa-question-circle helpIcon" id="helpIcon1" onclick="displayHelpWindow(1)"></span></h2>
		
		<div id="upload_container_button">
			<form id="formUploadFile" method="POST" action="get-data.php" enctype='multipart/form-data'>
				<input type="file" name="file-1" id="file-1" class="inputfile inputfile-1" style="display: none;" />
				<label for="file-1"><span class="fa fa-upload" aria-hidden="true"></span><span style="padding-left:4px;">Choose a file&hellip;</span></label>
			</form>
			
		</div>
	
		<script>
		document.getElementById("file-1").onchange = function() {
			document.getElementById("formUploadFile").submit();
		};
		</script>
	</div>
	
	<div id="showcase_container">
		<h2>Showcase</h2>
		<div class="showcase_item">
			<a href="vis.php?file=WebCompany-2889e#" title="WebCompany" target="_blank">
				<img src="img/webcompany.jpg">
			</a>
			<h3 style="position:absolute;">WebCompany</h3>
		</div>
		<div class="showcase_item">
			<a href="vis.php?file=CMScompany-6de43" title="CMScompany" target="_blank">
				<img src="img/cmscompany.jpg">
			</a>
			<h3 style="position:absolute;">CMScompany</h3>
		</div>
		
		
		
	
	</div>
        
        <div id="showcase_container"><ul>
                <h2>RE 2018 Course</h2>
         <?php
        $actual_link = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
        $files = array_diff(scandir("./input"), array('.', '..'));
        foreach ($files as $value) {
            echo "<li><a href='" .$actual_link . "vis.php?file=" . 
                    substr($value, 0, strlen($value)-3) . "'>" . 
                    substr($value, 0, strlen($value)-3) . "</a></li>" 
                    ;
        }

        ?>
        </ul></div>
	
 </body>
 

 


 
 </html>