<?php 
// Test if our data came through
if (isset($_POST["concepts"])) {
    // Decode our JSON into PHP objects we can use
   // $concepts = json_decode($_POST["concepts"]);
	//$userStories = json_decode($_POST["userStories"]);
	//$associationNames = json_decode($_POST["associationNames"]);
	//$associations = json_decode($_POST["associations"]);
	
	//print_r($userStories);

	$file = "input/".$_POST["fileName"].".js";

	$fh = fopen($file, 'w') or die("can't open file");
	$stringData = "var concepts = ".$_POST["concepts"];
	$stringData = $stringData."\n"."var userStories = ".$_POST["userStories"];
	$stringData = $stringData."\n"."var associationNames = ".$_POST["associationNames"];
	$stringData = $stringData."\n"."var associations = ".$_POST["associations"];
	$stringData = $stringData."\n"."var arrayConceptPairs = ".$_POST["arrayConceptPairs"];
	
	//$stringData = '["test321","test3212"]';
	fwrite($fh, $stringData);
	fclose($fh);
	
}
?>