/* FUNCTIONS TO CREATE THE VISUALIZATION */
function createViewpoints(roleIds) {
  var width = $(document).width(),
    height = $(document).height()+250,
    colors = d3.scale.category10();

  var opts = {
    dataLength: 0,
    setLength: 0,
    duration: 800,
    circleOpacity: 0.4,
    innerOpacity: 0.2,
  };

  // Build simple getter and setter Functions
  for (var key in opts) {
    createViewpoints[key] = getSet(key, createViewpoints).bind(opts);
  }

  function getSet(option, component) {
    return function(_) {
      if (!arguments.length) {
        return this[option];
      }
      this[option] = _;
	  
      return component;
    };
  }

  function refreshInput() {
    var sel = d3.select(this),
      name = sel.attr("name"),
      value = sel.property("value")
    createViewpoints[name](value);
    if (name == 'dataLength' || name == 'setLength') {
      if (name == 'setLength') {
	  
        globalData = [] // we reshuffle everything
      }
      return refresh(generateData())
    }
    refresh();
  }

  //set input value accorging to options and handle change of input
  d3.selectAll('#inputs input')
    .each(function() {
      var sel = d3.select(this),
        name = sel.attr("name");
      sel.property("value", createViewpoints[name]())
    })
    .on('input', refreshInput)

  var layout = d3.layout.venn()
    .size([width, height])
    .packingStragegy(d3.layout.venn.force)
	//.normalize(false)
	// .setsSize(x => (Math.log(x) ))
	// .value(x => 1),
	
	
	
	/*
	svg = d3.select('svg')
	.attr("id", "playgraph")
    //better to keep the viewBox dimensions with variables
    .attr("viewBox", "0 0 " + width + " " + height )
    .attr("preserveAspectRatio", "xMidYMid meet")
    isFirstLayout = true;
	*/
	 svg = d3.select('svg')
	.attr("id", "playgraph")
    .attr("viewBox", "0 0 " + width + " " + height )
    .attr("preserveAspectRatio", "xMidYMid meet")
    isFirstLayout = true;

	var svg = d3.select("svg")
	.attr("width", "100%")
	.attr("height", "100%")
	.call(d3.behavior.zoom().on("zoom", function () {
		svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
	}))
	.on("dblclick.zoom", null) //PREVENT ZOOMING WHEN USING THE MOUSE BUTTON.
	.append("g")
	
function generateData(concepts) {
	data = [];

	for (var i in concepts) {
		if(countConceptsInSet(i) > 0) {			
			if(concepts[i]['type'] == 0) {			
				var name = concepts[i]['name'];
				arr = [];

				for (var j in concepts[i]['roleIds']) {
					var flag = 0;
					for(var y in roleIds) {
						if(roleIds[y] == concepts[i]['roleIds'][j]) {
							flag = 1;
						}
						
					}
					
					if(flag == 1) {	//if the filter menu is used to select a role
						arr.push(concepts[i]['roleIds'][j]);
					
					} else if(roleIds == undefined) { //if none are selected (start screen)
						arr.push(concepts[i]['roleIds'][j]);
						
					}
								
				}

				if(arr != undefined) {
					if(arr.length > 0) {
						b = {"index":i,"name":name,"px":0,"py":0,"r":34,"x":i,"y":i,"set":arr}

						data.push(b);
				
					}
				
				}

			}

		}
		
	}

	for (var i in roleIds) {
		var count = countConceptsInSet(roleIds[i]);
			count = count*3;
			for(j = 0; j < 100+count; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[i]]}
				data.push(b);
			
			}

	}
	
	if(roleIds[0] != undefined && roleIds[1] != undefined) {
		var array = [""+roleIds[0]+"", ""+roleIds[1]+""];
		if(checkAreasContainConcepts(array) == 1) {
		
		var count = 0;
		count = count +	countConceptsInArea(array);

			for(j = 0; j < 30+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[0],roleIds[1]]}
				data.push(b);

			}
			
		}

	}
	
	//AREA BC
	if(roleIds[1] != undefined && roleIds[2] != undefined) {
		var array = [""+roleIds[1]+"", ""+roleIds[2]+""];
		

			var count = 0;
			count = count +	countConceptsInArea(array);
			
			for(j = 0; j < 30+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[1],roleIds[2]]}
				data.push(b);

			}
		
		
	
	}
	
	//AREA AC
	if(roleIds[0] != undefined && roleIds[2] != undefined) {	
		var array = [""+roleIds[0]+"", ""+roleIds[2]+""];
		
	
			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 30+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[0],roleIds[2]]}
				data.push(b);
	
			}
		
		
	
	}
	
	//AREA AD
	if(roleIds[0] != undefined && roleIds[3] != undefined) {
		var array = [""+roleIds[0]+"", ""+roleIds[3]+""];

		var count = 0;
		count = count +	countConceptsInArea(array);
		
		for(j = 0; j < 30+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[0],roleIds[3]]}
				data.push(b);
	
			}
		
		
	
	}
		
	//AREA BD
	if(roleIds[1] != undefined && roleIds[3] != undefined) {
	
		var array = [""+roleIds[1]+"", ""+roleIds[3]+""];
		var count = 0;
		count = count +	countConceptsInArea(array);
		
		for(j = 0; j < 30+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[1],roleIds[3]]}
				data.push(b);
	
			}
		
		
	
	}
	
	//AREA CD
	if(roleIds[2] != undefined && roleIds[3] != undefined) {
	
	var array = [""+roleIds[2]+"", ""+roleIds[3]+""];
		
	if(checkAreasContainConcepts(array) == 1) {
		var count = 0;
		count = count +	countConceptsInArea(array);
		
		for(j = 0; j < 30+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[2],roleIds[3]]}
				data.push(b);
	
			}
		
		}
	
	}

	//AREA AE
	if(roleIds[0] != undefined && roleIds[4] != undefined) {
	
	var array = [""+roleIds[0]+"", ""+roleIds[4]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
		
			var count = 0;
			count = count +	countConceptsInArea(array);
			
			for(j = 0; j < 30+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[0],roleIds[4]]}
				data.push(b);
		
			}
			
	}
	
	}
	
			//AREA BE
	if(roleIds[1] != undefined && roleIds[4] != undefined) {
		var array = [""+roleIds[1]+"", ""+roleIds[4]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 30+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[1],roleIds[4]]}
				data.push(b);
	
			}
		
		}
	
	}
	
			//AREA CE
	if(roleIds[2] != undefined && roleIds[4] != undefined) {

		var array = [""+roleIds[2]+"", ""+roleIds[4]+""];
		var count = 0;
		count = count +	countConceptsInArea(array);
		
		for(j = 0; j < 30+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[2],roleIds[4]]}
				data.push(b);
	
			}
		
		
	
	}
	
	//AREA DE
	if(roleIds[3] != undefined && roleIds[4] != undefined) {

		var array = [""+roleIds[3]+"", ""+roleIds[4]+""];
		var count = 0;
		count = count +	countConceptsInArea(array);
		
		for(j = 0; j < 30+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[3],roleIds[4]]}
				data.push(b);
	
			}

	}

	//AREA ABC
	if(roleIds[0] != undefined && roleIds[1] != undefined && roleIds[2] != undefined) {
		var array = [""+roleIds[0]+"", ""+roleIds[1]+"", ""+roleIds[2]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
		
			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 40+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[0],roleIds[1],roleIds[2]]}
				data.push(b);
	
			}
			
		}

	}
	
	//AREA ABD
	if(roleIds[0] != undefined && roleIds[1] != undefined && roleIds[3] != undefined) {
	
		var array = [""+roleIds[0]+"", ""+roleIds[1]+"", ""+roleIds[3]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
			var count = 0;
			count = count +	countConceptsInArea(array);
	
			for(j = 0; j < 40+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[0],roleIds[1],roleIds[3]]}
				data.push(b);
	
			}
			
		}
		
	}
	
	//AREA ACD
	if(roleIds[0] != undefined && roleIds[2] != undefined && roleIds[3] != undefined) {
	
		var array = [""+roleIds[0]+"", ""+roleIds[2]+"", ""+roleIds[3]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
	
			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 40+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[0],roleIds[2],roleIds[3]]}
				data.push(b);
	
			}
			
		}

	}
	
	//AREA BCD
	if(roleIds[1] != undefined && roleIds[2] != undefined && roleIds[3] != undefined) {
	
		var array = [""+roleIds[1]+"", ""+roleIds[2]+"", ""+roleIds[3]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
	
			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 40+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[1],roleIds[2],roleIds[3]]}
				data.push(b);
	
			}
			
		}

	}

	//AREA ABE
	if(roleIds[0] != undefined && roleIds[1] != undefined && roleIds[4] != undefined) {
	
		var array = [""+roleIds[0]+"", ""+roleIds[1]+"", ""+roleIds[4]+""];
		
		if(checkAreasContainConcepts(array) == 1) {

			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 40+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[0],roleIds[1],roleIds[4]]}
				data.push(b);
	
			}
			
		}

	}

	//AREA ACE
	if(roleIds[0] != undefined && roleIds[2] != undefined && roleIds[4] != undefined) {
	
		var array = [""+roleIds[0]+"", ""+roleIds[2]+"", ""+roleIds[4]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
	
			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 40+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[0],roleIds[2],roleIds[4]]}
				data.push(b);
	
			}
			
		}

	}
	
	//AREA ADE
	if(roleIds[0] != undefined && roleIds[3] != undefined && roleIds[4] != undefined) {
	
		var array = [""+roleIds[0]+"", ""+roleIds[3]+"", ""+roleIds[4]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
	
			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 40+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[0],roleIds[3],roleIds[4]]}
				data.push(b);
	
			}
			
		}

	}
	
	//AREA BCE
	if(roleIds[1] != undefined && roleIds[2] != undefined && roleIds[4] != undefined) {
	
		var array = [""+roleIds[1]+"", ""+roleIds[2]+"", ""+roleIds[4]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
	
			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 40+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[1],roleIds[2],roleIds[4]]}
				data.push(b);
	
			}
			
		}

	}
	
	//AREA BDE
	if(roleIds[1] != undefined && roleIds[3] != undefined && roleIds[4] != undefined) {
	
		var array = [""+roleIds[1]+"", ""+roleIds[3]+"", ""+roleIds[4]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
	
			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 40+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[1],roleIds[3],roleIds[4]]}
				data.push(b);
	
			}
			
		}

	}
	
	//AREA CDE
	if(roleIds[2] != undefined && roleIds[3] != undefined && roleIds[4] != undefined) {
	
		var array = [""+roleIds[2]+"", ""+roleIds[3]+"", ""+roleIds[4]+""];
		
		if(checkAreasContainConcepts(array) == 1) {

			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 40+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[2],roleIds[3],roleIds[4]]}
				data.push(b);
	
			}
			
		}

	}
	
	//AREA ABCD
	if(roleIds[0] != undefined && roleIds[1] != undefined && roleIds[2] != undefined && roleIds[3] != undefined) {
		var array = [""+roleIds[0]+"", ""+roleIds[1]+"", ""+roleIds[2]+"", ""+roleIds[3]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
		
			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 10+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[0],roleIds[1],roleIds[2],roleIds[3]]}
				data.push(b);
	
			}
			
		}

	}
	
	//AREA ABCE
	if(roleIds[0] != undefined && roleIds[1] != undefined && roleIds[2] != undefined && roleIds[4] != undefined) {
		var array = [""+roleIds[0]+"", ""+roleIds[1]+"", ""+roleIds[2]+"", ""+roleIds[4]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
		
			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 10+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[0],roleIds[1],roleIds[2],roleIds[4]]}
				data.push(b);
	
			}
			
		}

	}
	
	//AREA ABDE
	if(roleIds[0] != undefined && roleIds[1] != undefined && roleIds[3] != undefined && roleIds[4] != undefined) {
		var array = [""+roleIds[0]+"", ""+roleIds[1]+"", ""+roleIds[3]+"", ""+roleIds[4]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
		
			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 10+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[0],roleIds[1],roleIds[3],roleIds[4]]}
				data.push(b);
	
			}
			
		}

	}
	
	//AREA ACDE
	if(roleIds[0] != undefined && roleIds[2] != undefined && roleIds[3] != undefined && roleIds[4] != undefined) {
		var array = [""+roleIds[0]+"", ""+roleIds[2]+"", ""+roleIds[3]+"", ""+roleIds[4]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
		
			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 10+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[0],roleIds[2],roleIds[3],roleIds[4]]}
				data.push(b);
	
			}
			
		}

	}
	
	//AREA BCDE
	if(roleIds[1] != undefined && roleIds[2] != undefined && roleIds[3] != undefined && roleIds[4] != undefined) {
		var array = [""+roleIds[1]+"", ""+roleIds[2]+"", ""+roleIds[3]+"", ""+roleIds[4]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
		
			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 10+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[1],roleIds[2],roleIds[3],roleIds[4]]}
				data.push(b);
	
			}
			
		}

	}

	//AREA ABCDE
	if(roleIds[0] != undefined && roleIds[1] != undefined && roleIds[2] != undefined && roleIds[3] != undefined && roleIds[4] != undefined) {
		var array = [""+roleIds[0]+"", ""+roleIds[1]+"", ""+roleIds[2]+"", ""+roleIds[3]+"", ""+roleIds[4]+""];
		
		if(checkAreasContainConcepts(array) == 1) {
		
			var count = 0;
			count = count +	countConceptsInArea(array);
		
			for(j = 0; j < 10+count*3; j++) {
				var name = ""+j;
				b = {"index":undefined,"name":"","px":0,"py":0,"r":0,"x":210.8214765455125,"y":388.67605654343064,"set":[roleIds[0],roleIds[1],roleIds[2],roleIds[3],roleIds[4]]}
				data.push(b);
	
			}
			
		}

	}
		
	//console.log(data);
	
				
    return data;
	
  }

  
  function refresh(data) {
    if (data) {
      // we recalculate the layout for new data only
      layout.nodes(data)
    }

    var vennArea = svg.selectAll("g.venn-area")
      .data(layout.sets().values(), function(d) {
			return d.__key__;
		

	 });	  

    var vennEnter = vennArea.enter()
      .append('g')
      .attr("class", function(d) {
        return "venn-area venn-" +
          (d.sets.length == 1 ? "circle" : "intersection");
      })
      .attr('fill', function(d, i) {
		
        return colors(i)
      })
	 
    vennEnter.append('path')
	.style("fill-opacity", .4)
	.style("stroke-width", 10)
	.style("stroke-opacity", 0.9)
	.style("fill", function(d,i) { return colors(i); })
	.style("stroke", function(d,i) { return colors(i); })
	.attr('class', 'venn-area-path');
	
	
	d3.selectAll(".venn-circle")
	.on("mouseover", function(d, i) {
		var node = d3.select(this).transition();
		node.select("path").style("fill-opacity", 0.9);		
		node.select("text").style("font-weight", "100")
		.style("font-size", "36px");
	})
	.on("mouseout", function(d, i) {
		var node = d3.select(this).transition();
		node.select("path").style("fill-opacity", .4);
		node.select("text").style("font-weight", "100")
		.style("font-size", "24px");
	});

    vennEnter.append("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")

    vennArea.selectAll('path.venn-area-path').transition()
      .duration(isFirstLayout ? 0 : createViewpoints.duration())
      .attr('opacity', createViewpoints.circleOpacity())
      .attrTween('d', function(d) {
        return d.d
      });
	  
    //we need to rebind data so that parent data propagetes to child nodes (otherwise, updating parent has no effect on child.__data__ property)
    vennArea.selectAll("text.label").data(function(d) {
        return [d];
      })
		.style("font-size", "24px")
		.style("font-weight", "100")
		.style("text-transform", "capitalize")
		.text(function(d) {
			
		var viewpointName = "";
		for (var i in concepts) {
			if(concepts[i]['type'] == 1) {	
				if(d.__key__ == i) {
					viewpointName = concepts[i]['name'];
					
				
						var y = 0;
					
		
				} 
					
			}
				
		}
			
        return viewpointName;
		
      })
	  .attr("id", function(d) { //role id
			return 'role_'+d.__key__;
		})
		.attr("x", function(d) {
			return d.center.x
		})
		.attr("y", function(d) {		
			var viewpointName = "";
				for (var i in concepts) {
					if(concepts[i]['type'] == 1) {	
						if(d.__key__ == i) {
							viewpointName = concepts[i]['name'];
							
						
								var vy = 132;
							
				
						} 
							
					}
						
				}
		
			return d.center.y-vy
		});
		
	
    //we need to rebind data so that parent data propagetes to child nodes (otherwise, updating parent has no effect on child.__data__ property)
    vennArea.selectAll('circle.inner').data(function(d) {
        return [d];
      }).transition()
      .duration(isFirstLayout ? 0 : createViewpoints.duration())
      .attr('opacity', createViewpoints.innerOpacity())
      .attr("cx", function(d) {
        return d.center.x
      })
      .attr("cy", function(d) {
        return d.center.y
      })
      .attr('r', function(d) {
        return d.innerRadius
      });

    vennArea.exit().transition()
      .duration(createViewpoints.duration())
      .attrTween('d', function(d) {
        return d.d
      })
      .remove()

    // need this so that nodes always on top
    var circleContainer = svg.selectAll("g.venn-circle-container")
      .data(layout.sets().values(), function(d) {
        return d.__key__;
      });

    circleContainer.enter()
      .append('g')
      .attr("class", "venn-circle-container")  
	  /*
	     .attr('fill', function(d, i) {
        return colors(i)
      });
	  */

   
    circleContainer.exit().remove();

    var points = circleContainer.selectAll("circle.node")
      .data(function(d) {
        return d.nodes
      }, function(d) {
        return d.name
      });      
   
var drag = d3.behavior.drag()
		.origin(function(d) { return d; })
		.on("dragstart", dragstarted)
		.on("drag", dragged);
   

    var g = points.enter().append("g")
	.attr('class', function(d) {
        return 'g_'+d.index;
      })
	.call(drag);
	
    g.append('circle')
      .attr('r', 0)
      .attr('class', 'node')
      

	 //WE CREATE THE ASSOCIATION ICONS
	setTimeout(function(){

	g.append("text")
	.each(function (d) {
		var name =function(d){
		return d.name;
		}
		var position = 0;
		for (var i in associations) {
			var conceptId = getConceptIdByName(d.name);
	
		if(concepts[conceptId] != undefined) {
			if(concepts[conceptId]['type'] != 1) {
				if(associations[i]['conceptId'] == conceptId) {
					var roleId = associations[i]['roleId'];
					var inRoleIds = checkRoleInSelectedRoles(roleId, roleIds)
			
						if(inRoleIds == 1) {
						position = position + 1;
						
						var associationId = associations[i]['associationId'];
					
						var gElement = d3.select(".g_"+conceptId);
						
						var x = 0;
						var y = 0;
						
						if(position == 1) {
							x = 25;
							y = 25;
							
						} else if(position == 2) {
							x = 32;
							y = 10;
							
						} else if(position == 3) {
							x = 32;
							y = -5;
							
						} else if(position == 4) {
							x = 25;
							y = -20;
							
						} else if(position == 5) {
							x = 12;
							y = -28;
							
						} else if(position == 6) {
							x = -3;
							y = -30;
							
						} else if(position == 7) {
							x = -18;
							y = -25;
							
						} else if(position == 8) {
							x = -27;
							y = -15;
							
						}
					
						d3.select(this).append("tspan")
						.html('<tspan class="associationLogo">O</tspan>')
						.attr("text-anchor", "middle")
						.attr("x", x)
						.attr("y", y)
						.attr("class", "conceptAssociationIcon_"+conceptId+" associationIcon_"+associationId+" associationIcon association_"+i+"")
						.style("stroke", associationNames[associationId]['color'])
						.style("fill", associationNames[associationId]['color']);

						}
					
					}
					
				}
		
			}
		
		}
		
	});
 
 var countAssociations = 0;
	g.append("text")
	.each(function (d) {
		var name =function(d){
		return d.name;
		}
		var position = 0;
		for (var i in associations) {
			var conceptId = getConceptIdByName(d.name);
	
		if(concepts[conceptId] != undefined) {
			if(concepts[conceptId]['type'] != 1) {
				if(associations[i]['conceptId'] == conceptId) {
						var roleId = associations[i]['roleId'];
						
						var inRoleIds = checkRoleInSelectedRoles(roleId, roleIds);

						if(inRoleIds == 1) {
							position = position + 1;
							
							var associationId = associations[i]['associationId'];
							
							var associationNameFirstChar = associationNames[associationId]['name'];
							associationNameFirstChar = associationNameFirstChar.charAt(0);
							
							var gElement = d3.select(".g_"+conceptId);

							for(var j in associations) {
								if(associations[j]['roleId'] == roleId) {
									if(associations[j]['conceptId'] == conceptId) {
										countAssociations = countAssociations + 1;
									}
								
								}
		
							}

							var x = 0;
							var y = 0;
							
							if(position == 1) {
								x = 25;
								y = 25;
								
							} else if(position == 2) {
								x = 32;
								y = 10;
								
							} else if(position == 3) {
								x = 32;
								y = -5;
								
							} else if(position == 4) {
								x = 25;
								y = -20;
								
							} else if(position == 5) {
								x = 12;
								y = -28;
								
							} else if(position == 6) {
								x = -3;
								y = -30;
								
							} else if(position == 7) {
								x = -18;
								y = -25;
								
							} else if(position == 8) {
							x = -27;
							y = -15;
							
							}
							
							d3.select(this).append("tspan")
							.html('<tspan onclick="displayAssociationWindow('+i+')" class="associationLogo2">'+associationNameFirstChar+'</tspan>')
							.attr("text-anchor", "middle")
							.attr("x", x)
							.attr("y", y)
							.attr("class", "conceptAssociationIcon_"+conceptId+" associationIcon_"+associationId+" associationIcon association_"+i+"")
							//.attr("class", "nodeText")
							.style("fill", "#000000");

						}
						
					}
				
				}
		
			}
		
		}
		
	});

}, 100);
  
    g.append("text")
		.each(function (d) {
		var name =function(d){
      	return d.name;
    	}
		var arr = d.name.split(" ");
		for (i = 0; i < arr.length; i++) {
			if(arr.length>1) { //IF THE TEXT LABEL CONTAINS MORE WORD WE ADD BREAK LINES AND SET THE PADDING OF THE FIRST WORD To -0.4em
				d3.select(this).append("tspan")
				.text(arr[i])
				/* .text(d.index+arr[i]) */
				.attr("text-anchor", "middle")
				.attr("x", 0)
				//.attr("class", "nodeText")
				.attr("class", 'nodeText nodeText_'+d.index)
				.attr("dy", i ? "1.2em" : -0.4) //we set the padding to 1.2, except for the first word for which we set the padding -0.4em
				.style("fill", "#000000");
				
			} else {	//IF THE TEXT LABEL CONTAINS ONLY ONE WORD WE DO NOT ADD BREAK LINE AND SET THE PADDING TO 0.4em
				d3.select(this).append("tspan")
				.text(arr[i])
				/* .text(d.index+arr[i]) */
				.attr("text-anchor", "middle")
				.attr("x", 0)
				//.attr("class", "nodeText")
				.attr("class", 'nodeText nodeText_'+d.index)			
				.attr("dy", "0.4em")
				.style("fill", "#000000");
				
			}
		
		}
		
	});
	

    g.selectAll("circle").transition()
      .duration(isFirstLayout ? 0 : createViewpoints.duration())
      .attr('r', function(d) {
        return d.r-12
      })
	   .attr('class', function(d) {
        return 'node node_'+d.index;
      })

    points.exit().transition()
      .attr('r', 0)
      .remove()

    isFirstLayout = false;

    //set the force ticker    
    layout.packingConfig({
        ticker: function() {
          g.attr("transform", function(d) {
              return "translate(" + d.x + "," + d.y + ")";
          })
        }
      })
	  
     //start the force layout
    layout.packer().start()
    return createViewpoints
  }

	setAmbiguityColor(roleIds);

  return refresh(generateData(concepts))

}