(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
   typeof define === 'function' && define.amd ? define('d3-venn', ['exports'], factory) :
   factory((global.d3_venn = {}));
}(this, function (exports) { 'use strict';

   /**
    * getSet creates a getter/setter function for a re-usable D3.js component. 
    *
    * @method getSet
    * @param  {string}   option    - the name of the object in the string you want agetter/setter for.
    * @param  {function} component - the D3 component this getter/setter relates to.
    *
    * @return {mixed} The value of the option or the component.
    */

   function getSet(option, component) {
     return function(_) {
       if (! arguments.length) {
         return this[option];
       }

       this[option] = _;

       return component;
     };
   }

   function applier(component, options) {
   	for (var key in options) {
           if(component[key] && (typeof component[key] == "function")) {
               component[key](options[key]);
           }
       }
       return component;
   }

   function binder(component, options) {
   	for (var key in options) {
           if(!component[key]) {
               component[key] = getSet(key, component).bind(options);
           }
       }
   }

   // import distance from 
   const SMALL = 1e-10;

   /** Returns the intersection area of a bunch of circles (where each circle
    is an object having an x,y and radius property) */
   function intersectionArea(circles, stats) {
       // get all the intersection points of the circles
       var intersectionPoints = getIntersectionPoints(circles);

       // filter out points that aren't included in all the circles
       var innerPoints = intersectionPoints.filter(function(p) {
           return containedInCircles(p, circles);
       });

       var arcArea = 0,
           polygonArea = 0,
           arcs = [],
           i;

       // if we have intersection points that are within all the circles,
       // then figure out the area contained by them
       if (innerPoints.length > 1) {
           // sort the points by angle from the center of the polygon, which lets
           // us just iterate over points to get the edges
           var center = getCenter(innerPoints);
           for (i = 0; i < innerPoints.length; ++i) {
               var p = innerPoints[i];
               p.angle = Math.atan2(p.x - center.x, p.y - center.y);
           }
           innerPoints.sort(function(a, b) {
               return b.angle - a.angle;
           });

           // iterate over all points, get arc between the points
           // and update the areas
           var p2 = innerPoints[innerPoints.length - 1];
           for (i = 0; i < innerPoints.length; ++i) {
               var p1 = innerPoints[i];

               // polygon area updates easily ...
               polygonArea += (p2.x + p1.x) * (p1.y - p2.y);

               // updating the arc area is a little more involved
               var midPoint = {
                       x: (p1.x + p2.x) / 2,
                       y: (p1.y + p2.y) / 2
                   },
                   arc = null;

               for (var j = 0; j < p1.parentIndex.length; ++j) {
                   if (p2.parentIndex.indexOf(p1.parentIndex[j]) > -1) {
                       // figure out the angle halfway between the two points
                       // on the current circle
                       var circle = circles[p1.parentIndex[j]],
                           a1 = Math.atan2(p1.x - circle.x, p1.y - circle.y),
                           a2 = Math.atan2(p2.x - circle.x, p2.y - circle.y);

                       var angleDiff = (a2 - a1);
                       if (angleDiff < 0) {
                           angleDiff += 2 * Math.PI;
                       }

                       // and use that angle to figure out the width of the
                       // arc
                       var a = a2 - angleDiff / 2,
                           width = distance(midPoint, {
                               x: circle.x + circle.radius * Math.sin(a),
                               y: circle.y + circle.radius * Math.cos(a)
                           });

                       // pick the circle whose arc has the smallest width
                       if ((arc === null) || (arc.width > width)) {
                           arc = {
                               circle: circle,
                               width: width,
                               p1: p1,
                               p2: p2
                           };
                       }
                   }
               }
               arcs.push(arc);
               arcArea += circleArea(arc.circle.radius, arc.width);
               p2 = p1;
           }
       } else {
           // no intersection points, is either disjoint - or is completely
           // overlapped. figure out which by examining the smallest circle
           var smallest = circles[0];
           for (i = 1; i < circles.length; ++i) {
               if (circles[i].radius < smallest.radius) {
                   smallest = circles[i];
               }
           }

           // make sure the smallest circle is completely contained in all
           // the other circles
           var disjoint = false;
           for (i = 0; i < circles.length; ++i) {
               if (distance(circles[i], smallest) > Math.abs(smallest.radius - circles[i].radius)) {
                   disjoint = true;
                   break;
               }
           }

           if (disjoint) {
               arcArea = polygonArea = 0;

           } else {
               arcArea = smallest.radius * smallest.radius * Math.PI;
               arcs.push({
                   circle: smallest,
                   p1: {
                       x: smallest.x,
                       y: smallest.y + smallest.radius
                   },
                   p2: {
                       x: smallest.x - SMALL,
                       y: smallest.y + smallest.radius
                   },
                   width: smallest.radius * 2
               });
           }
       }

       polygonArea /= 2;
       if (stats) {
           stats.area = arcArea + polygonArea;
           stats.arcArea = arcArea;
           stats.polygonArea = polygonArea;
           stats.arcs = arcs;
           stats.innerPoints = innerPoints;
           stats.intersectionPoints = intersectionPoints;
       }

       return arcArea + polygonArea;
   }


   /** returns whether a point is contained by all of a list of circles */
   function containedInCircles(point, circles) {
       for (var i = 0; i < circles.length; ++i) {
           if (distance(point, circles[i]) > circles[i].radius + SMALL) {
               return false;
           }
       }
       return true;
   }

   /** Gets all intersection points between a bunch of circles */
   function getIntersectionPoints(circles) {
       var ret = [];
       for (var i = 0; i < circles.length; ++i) {
           for (var j = i + 1; j < circles.length; ++j) {
               var intersect = circleCircleIntersection(circles[i],
                   circles[j]);
               for (var k = 0; k < intersect.length; ++k) {
                   var p = intersect[k];
                   p.parentIndex = [i, j];
                   ret.push(p);
               }
           }
       }
       return ret;
   }

   function circleIntegral(r, x) {
       var y = Math.sqrt(r * r - x * x);
       return x * y + r * r * Math.atan2(x, y);
   }

   /** Returns the area of a circle of radius r - up to width */
    function circleArea(r, width) {
       return circleIntegral(r, width - r) - circleIntegral(r, -r);
   }


   /** euclidean distance between two points */
    function distance(p1, p2) {
       return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) +
           (p1.y - p2.y) * (p1.y - p2.y));
   }


   /** Returns the overlap area of two circles of radius r1 and r2 - that
   have their centers separated by distance d. Simpler faster
   circle intersection for only two circles */
    function circleOverlap(r1, r2, d) {
       // no overlap
       if (d >= r1 + r2) {
           return 0;
       }

       // completely overlapped
       if (d <= Math.abs(r1 - r2)) {
           return Math.PI * Math.min(r1, r2) * Math.min(r1, r2);
       }

       var w1 = r1 - (d * d - r2 * r2 + r1 * r1) / (2 * d),
           w2 = r2 - (d * d - r1 * r1 + r2 * r2) / (2 * d);
       return circleArea(r1, w1) + circleArea(r2, w2);
   }


   /** Given two circles (containing a x/y/radius attributes),
   returns the intersecting points if possible.
   note: doesn't handle cases where there are infinitely many
   intersection points (circles are equivalent):, or only one intersection point*/
   function circleCircleIntersection(p1, p2) {
       var d = distance(p1, p2),
           r1 = p1.radius,
           r2 = p2.radius;

       // if to far away, or self contained - can't be done
       if ((d >= (r1 + r2)) || (d <= Math.abs(r1 - r2))) {
           return [];
       }

       var a = (r1 * r1 - r2 * r2 + d * d) / (2 * d),
           h = Math.sqrt(r1 * r1 - a * a),
           x0 = p1.x + a * (p2.x - p1.x) / d,
           y0 = p1.y + a * (p2.y - p1.y) / d,
           rx = -(p2.y - p1.y) * (h / d),
           ry = -(p2.x - p1.x) * (h / d);

       return [{
           x: x0 + rx,
           y: y0 - ry
       }, {
           x: x0 - rx,
           y: y0 + ry
       }];
   }

   /** Returns the center of a bunch of points */
   function getCenter(points) {
       var center = {
           x: 0,
           y: 0
       };
       for (var i = 0; i < points.length; ++i) {
           center.x += points[i].x;
           center.y += points[i].y;
       }
       center.x /= points.length;
       center.y /= points.length;
       return center;
   }

   //return true when the point is out of all circles
   function outOfCircles(point, circles) {
     for (var i = 0; i < circles.length; ++i) {
       if (venn.distance(point, circles[i]) < circles[i].radius + SMALL) {
         return false;
       }
     }
     return true;
   }


   // function called from d3.layout.venn 
   // used to pack child nodes insiside inner circle of a venn set.
   function pack(layout) {
     // var valueFn = layout.value();
     var packerConfig = layout.packerConfig();

     layout.sets().forEach(function(k,set) {
       // function pack(set, valueFn) {
       var innerRadius = set.innerRadius,
         center = set.center,
         children = set.nodes,
         x = center.x - innerRadius,
         y = center.y - innerRadius;

       applier(d3.layout.pack(), packerConfig)
         .size([innerRadius * 2, innerRadius * 2])
         .nodes({
           children: children
         });
       // translate the notes to the center    
       if (children) {
         children.forEach(function(n) {
           n.x += x;
           n.y += y;
         });
       }
     })
   }

   // function called from d3.layout.venn 
   // used to randomly distribute child nodes insiside a venn set.
   // d3.layout.venn.packCircles looks prettier.
   function distribute(layout) {
     // var valueFn = layout.value(),
     var circles = layout.circles();

     layout.sets().forEach(function(k,set) {
       var queue = [],
         maxAttempt = 500,
         k,
         inCircles = [],
         outCircles = [];


       for (k in circles) {
         if (set.sets.indexOf(k) > -1) {
           inCircles.push(circles[k])
         } else {
           outCircles.push(circles[k])
         }
       }

       // distanceToCircles.set(set.__key, computeDistanceToCircles(set))
       set.nodes.map(function(n, i) {
         var attempt = 0,
           candidate = null;

         if (i == 0) { // first node centered
           n.x = textCentres[set.__key__].x;
           n.y = textCentres[set.__key__].y;
           queue.push(n)
         } else {
           while (!candidate && (attempt < maxAttempt)) {
             var i = Math.random() * queue.length | 0,
               s = queue[i],
               a = 2 * Math.PI * Math.random(),
               r = Math.sqrt(Math.random() * ((innerRadius * innerRadius) + (10 * 10))),
               p = {
                 x: s.x + r * Math.cos(a),
                 y: s.y + r * Math.sin(a)
               };
             attempt++;
             if (venn.containedInCircles(p, inCircles) && (outOfCircles(p, outCircles))) {
               candidate = p;
               queue.push(p)
             }

           }
           if (!candidate) {
             console.warn('NO CANDIDATE')
             candidate = {
               x: textCentres[set.__key__].x,
               y: textCentres[set.__key__].y
             }
           }
           n.x = candidate.x;
           n.y = candidate.y;

           nodes.push(n);
         }
       });
     })
   }

   // apply a d3.fore layout with foci on venn area center to set foci
   // d3.layout.venn.packCircles looks prettier.
   function force(layout, data) {

     var force = layout.packer()
     if (!force) {
       force = d3.layout.force();
       binder(force, {
       	padding : 3,
       	maxRadius : 8,
         collider : true,
         ticker: null

       });
     }

     var packingConfig = layout.packingConfig(),
       size = layout.size(),
       sets = layout.sets(),
      
       padding = force.padding(), // separation between nodes
       maxRadius = force.maxRadius(),
       collider = force.collider;
     // foci = d3.map({}, function(d) {
     //   return d.__key__
     // });

     // layout.sets().forEach(function(set) {
     //   foci.set(set.__key__, set.center);
     // })

     applier(force, packingConfig)
       .nodes(data)
       .links([])
       .gravity(0)
       .charge(0)
       .size(size)
       .on('start', init)
       .on('tick', tick)
       
     function init(e) {
       data.forEach(function(d) {
       	var center = sets.get(d.__setKey__).center;
         d.x = d.x ? d.x * 1 : center.x;
         d.y = d.y ? d.y * 1 : center.y;
       })
     }

     function tick(e) {
       var ticker;
       data
         .forEach(gravity(.2 * e.alpha))
       
        if(collider) {
        data
       	 	.forEach(collide(.5))
   		}
       if (ticker = force.ticker()) {
         ticker(layout)
       }
     }
       // Move nodes toward cluster focus.
       function gravity(alpha) {
         return function(d) {
           var center = sets.get(d.__setKey__).center;
           d.y += (center.y - d.y) * alpha;
           d.x += (center.x - d.x) * alpha;
        };
       }
       // Resolve collisions between nodes.
       function collide(alpha) {
         var  quadtree = d3.geom.quadtree(data);
         return function(d) {
           var r = d.r + maxRadius + padding,
             nx1 = d.x - r,
             nx2 = d.x + r,
             ny1 = d.y - r,
             ny2 = d.y + r;
           quadtree.visit(function(quad, x1, y1, x2, y2) {
             if (quad.point && (quad.point !== d)) {
               var x = d.x - quad.point.x,
                 y = d.y - quad.point.y,
                 l = Math.sqrt(x * x + y * y),
                 r = d.r + quad.point.r + (d.__setKey__ !== quad.point.__setKey__) * padding;
               if (l < r) {
                 l = (l - r) / l * alpha;
                 d.x -= x *= l;
                 d.y -= y *= l;
                 quad.point.x += x;
                 quad.point.y += y;
               }
             }
             return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
           });
         };
       }
       return force;

     }

   /** finds the zeros of a function, given two starting points (which must
    * have opposite signs */
   function bisect (f, a, b, parameters) {
       parameters = parameters || {};
       var maxIterations = parameters.maxIterations || 100,
           tolerance = parameters.tolerance || 1e-10,
           fA = f(a),
           fB = f(b),
           delta = b - a;

       if (fA * fB > 0) {
           throw "Initial bisect points must have opposite signs";
       }

       if (fA === 0) return a;
       if (fB === 0) return b;

       for (var i = 0; i < maxIterations; ++i) {
           delta /= 2;
           var mid = a + delta,
               fMid = f(mid);

           if (fMid * fA >= 0) {
               a = mid;
           }

           if ((Math.abs(delta) < tolerance) || (fMid === 0)) {
               return mid;
           }
       }
       return a + delta;
   }

   // need some basic operations on vectors, rather than adding a dependency,
   // just define here
   function zeros(x) {
       var r = new Array(x);
       for (var i = 0; i < x; ++i) {
           r[i] = 0;
       }
       return r;
   }

   function zerosM(x, y) {
       return zeros(x).map(function() {
           return zeros(y);
       });
   }


   function dot(a, b) {
       var ret = 0;
       for (var i = 0; i < a.length; ++i) {
           ret += a[i] * b[i];
       }
       return ret;
   }

   function norm2(a) {
       return Math.sqrt(dot(a, a));
   }

   function multiplyBy(a, c) {
       for (var i = 0; i < a.length; ++i) {
           a[i] *= c;
       }
   }


   function weightedSum(ret, w1, v1, w2, v2) {
       for (var j = 0; j < ret.length; ++j) {
           ret[j] = w1 * v1[j] + w2 * v2[j];
       }
   }

   /** minimizes a function using the downhill simplex method */
   function fmin(f, x0, parameters) {
       parameters = parameters || {};

       var maxIterations = parameters.maxIterations || x0.length * 200,
           nonZeroDelta = parameters.nonZeroDelta || 1.1,
           zeroDelta = parameters.zeroDelta || 0.001,
           minErrorDelta = parameters.minErrorDelta || 1e-6,
           rho = parameters.rho || 1,
           chi = parameters.chi || 2,
           psi = parameters.psi || -0.5,
           sigma = parameters.sigma || 0.5,
           callback = parameters.callback,
           temp;

       // initialize simplex.
       var N = x0.length,
           simplex = new Array(N + 1);
       simplex[0] = x0;
       simplex[0].fx = f(x0);
       for (var i = 0; i < N; ++i) {
           var point = x0.slice();
           point[i] = point[i] ? point[i] * nonZeroDelta : zeroDelta;
           simplex[i + 1] = point;
           simplex[i + 1].fx = f(point);
       }

       var sortOrder = function(a, b) {
           return a.fx - b.fx;
       };

       var centroid = x0.slice(),
           reflected = x0.slice(),
           contracted = x0.slice(),
           expanded = x0.slice();

       for (var iteration = 0; iteration < maxIterations; ++iteration) {
           simplex.sort(sortOrder);
           if (callback) {
               callback(simplex);
           }

           if (Math.abs(simplex[0].fx - simplex[N].fx) < minErrorDelta) {
               break;
           }

           // compute the centroid of all but the worst point in the simplex
           for (i = 0; i < N; ++i) {
               centroid[i] = 0;
               for (var j = 0; j < N; ++j) {
                   centroid[i] += simplex[j][i];
               }
               centroid[i] /= N;
           }

           // reflect the worst point past the centroid  and compute loss at reflected
           // point
           var worst = simplex[N];
           weightedSum(reflected, 1 + rho, centroid, -rho, worst);
           reflected.fx = f(reflected);

           // if the reflected point is the best seen, then possibly expand
           if (reflected.fx <= simplex[0].fx) {
               weightedSum(expanded, 1 + chi, centroid, -chi, worst);
               expanded.fx = f(expanded);
               if (expanded.fx < reflected.fx) {
                   temp = simplex[N];
                   simplex[N] = expanded;
                   expanded = temp;
               } else {
                   temp = simplex[N];
                   simplex[N] = reflected;
                   reflected = temp;
               }
           }

           // if the reflected point is worse than the second worst, we need to
           // contract
           else if (reflected.fx >= simplex[N - 1].fx) {
               var shouldReduce = false;

               if (reflected.fx <= worst.fx) {
                   // do an inside contraction
                   weightedSum(contracted, 1 + psi, centroid, -psi, worst);
                   contracted.fx = f(contracted);
                   if (contracted.fx < worst.fx) {
                       temp = simplex[N];
                       simplex[N] = contracted;
                       contracted = temp;
                   } else {
                       shouldReduce = true;
                   }
               } else {
                   // do an outside contraction
                   weightedSum(contracted, 1 - psi * rho, centroid, psi * rho, worst);
                   contracted.fx = f(contracted);
                   if (contracted.fx <= reflected.fx) {
                       temp = simplex[N];
                       simplex[N] = contracted;
                       contracted = temp;
                   } else {
                       shouldReduce = true;
                   }
               }

               if (shouldReduce) {
                   // do reduction. doesn't actually happen that often
                   for (i = 1; i < simplex.length; ++i) {
                       weightedSum(simplex[i], 1 - sigma, simplex[0], sigma - 1, simplex[i]);
                       simplex[i].fx = f(simplex[i]);
                   }
               }
           } else {
               temp = simplex[N];
               simplex[N] = reflected;
               reflected = temp;
           }

       }

       simplex.sort(sortOrder);
       return {
           f: simplex[0].fx,
           solution: simplex[0]
       };
   }


    function minimizeConjugateGradient( f, initial, params) {
       // allocate all memory up front here, keep out of the loop for perfomance
       // reasons
       var current = {
               x: initial.slice(),
               fx: 0,
               fxprime: initial.slice()
           },
           next = {
               x: initial.slice(),
               fx: 0,
               fxprime: initial.slice()
           },
           yk = initial.slice(),
           pk, temp,
           a = 1,
           maxIterations;

       params = params || {};
       maxIterations = params.maxIterations || initial.length * 5;

       current.fx = f(current.x, current.fxprime);
       pk = current.fxprime.slice();
       multiplyBy(pk, -1);

       for (var i = 0; i < maxIterations; ++i) {
           if (params.history) {
               params.history.push({
                   x: current.x.slice(),
                   fx: current.fx,
                   fxprime: current.fxprime.slice()
               });
           }

           a = wolfeLineSearch(f, pk, current, next, a);
           if (!a) {
               // faiiled to find point that satifies wolfe conditions.
               // reset direction for next iteration
               for (var j = 0; j < pk.length; ++j) {
                   pk[j] = -1 * current.fxprime[j];
               }
           } else {
               // update direction using Polak–Ribiere CG method
               weightedSum(yk, 1, next.fxprime, -1, current.fxprime);

               var delta_k = dot(current.fxprime, current.fxprime),
                   beta_k = Math.max(0, dot(yk, next.fxprime) / delta_k);

               weightedSum(pk, beta_k, pk, -1, next.fxprime);

               temp = current;
               current = next;
               next = temp;
           }

           if (norm2(current.fxprime) <= 1e-5) {
               break;
           }
       }

       if (params.history) {
           params.history.push({
               x: current.x.slice(),
               fx: current.fx,
               fxprime: current.fxprime.slice()
           });
       }

       return current;
   }

   var c1 = 1e-6;
   var c2 = 0.1;
   /// searches along line 'pk' for a point that satifies the wolfe conditions
   /// See 'Numerical Optimization' by Nocedal and Wright p59-60
   function wolfeLineSearch( f, pk, current, next, a) {
       var phi0 = current.fx,
           phiPrime0 = dot(current.fxprime, pk),
           phi = phi0,
           phi_old = phi0,
           phiPrime = phiPrime0,
           a0 = 0;

       a = a || 1;

       function zoom(a_lo, a_high, phi_lo) {
           for (var iteration = 0; iteration < 16; ++iteration) {
               a = (a_lo + a_high) / 2;
               weightedSum(next.x, 1.0, current.x, a, pk);
               phi = next.fx = f(next.x, next.fxprime);
               phiPrime = dot(next.fxprime, pk);

               if ((phi > (phi0 + c1 * a * phiPrime0)) ||
                   (phi >= phi_lo)) {
                   a_high = a;

               } else {
                   if (Math.abs(phiPrime) <= -c2 * phiPrime0) {
                       return a;
                   }

                   if (phiPrime * (a_high - a_lo) >= 0) {
                       a_high = a_lo;
                   }

                   a_lo = a;
                   phi_lo = phi;
               }
           }

           return 0;
       }

       for (var iteration = 0; iteration < 10; ++iteration) {
           weightedSum(next.x, 1.0, current.x, a, pk);
           phi = next.fx = f(next.x, next.fxprime);
           phiPrime = dot(next.fxprime, pk);
           if ((phi > (phi0 + c1 * a * phiPrime0)) ||
               (iteration && (phi >= phi_old))) {
               return zoom(a0, a, phi_old);
           }

           if (Math.abs(phiPrime) <= -c2 * phiPrime0) {
               return a;
           }

           if (phiPrime >= 0) {
               return zoom(a, a0, phi);
           }

           phi_old = phi;
           a0 = a;
           a *= 2;
       }

       return 0;
   }

   /** given a list of set objects, and their corresponding overlaps.
   updates the (x, y, radius) attribute on each set such that their positions
   roughly correspond to the desired overlaps */
   function venn$2(areas, parameters) {
       parameters = parameters || {};
       parameters.maxIterations = parameters.maxIterations || 500;
       var lossFn = parameters.lossFunction || lossFunction;
       var initialLayout = parameters.initialLayout || bestInitialLayout;
       var fminFn = parameters.fmin || fmin;

       // add in missing pairwise areas as having 0 size
       areas = addMissingAreas(areas);

       // initial layout is done greedily
       var circles = initialLayout(areas);

       // transform x/y coordinates to a vector to optimize
       var initial = [],
           setids = [],
           setid;
       for (setid in circles) {
           if (circles.hasOwnProperty(setid)) {
               initial.push(circles[setid].x);
               initial.push(circles[setid].y);
               setids.push(setid);
           }
       }

       // optimize initial layout from our loss function
       var totalFunctionCalls = 0;
       var solution = fminFn(
           function(values) {
               totalFunctionCalls += 1;
               var current = {};
               for (var i = 0; i < setids.length; ++i) {
                   var setid = setids[i];
                   current[setid] = {
                       x: values[2 * i],
                       y: values[2 * i + 1],
                       radius: circles[setid].radius,
                       // size : circles[setid].size
                   };
               }
               return lossFn(current, areas);
           },
           initial,
           parameters);

       // transform solution vector back to x/y points
       var positions = solution.solution;
       for (var i = 0; i < setids.length; ++i) {
           setid = setids[i];
           circles[setid].x = positions[2 * i];
           circles[setid].y = positions[2 * i + 1];
       }

       return circles;
   }

   /** Returns the distance necessary for two circles of radius r1 + r2 to
   have the overlap area 'overlap' */
   function distanceFromIntersectArea(r1, r2, overlap) {
       // handle complete overlapped circles
       if (Math.min(r1, r2) * Math.min(r1, r2) * Math.PI <= overlap + SMALL) {
           return Math.abs(r1 - r2);
       }

       return bisect(function(distance) {
           return circleOverlap(r1, r2, distance) - overlap;
       }, 0, r1 + r2);
   }

   /** Missing pair-wise intersection area data can cause problems:
    treating as an unknown means that sets will be laid out overlapping,
    which isn't what people expect. To reflect that we want disjoint sets
    here, set the overlap to 0 for all missing pairwise set intersections */
   function addMissingAreas(areas) {
       areas = areas.slice();

       // two circle intersections that aren't defined
       var ids = [],
           pairs = {},
           i, j, a, b;
       for (i = 0; i < areas.length; ++i) {
           var area = areas[i];
           if (area.sets.length == 1) {
               ids.push(area.sets[0]);
           } else if (area.sets.length == 2) {
               a = area.sets[0];
               b = area.sets[1];
               pairs[[a, b]] = true;
               pairs[[b, a]] = true;
           }
       }
       ids.sort(function(a, b) {
           return a > b;
       });

       for (i = 0; i < ids.length; ++i) {
           a = ids[i];
           for (j = i + 1; j < ids.length; ++j) {
               b = ids[j];
               if (!([a, b] in pairs)) {
                   areas.push({
                       'sets': [a, b],
                       'size': 0
                   });
               }
           }
       }
       return areas;
   }

   /// Returns two matrices, one of the euclidean distances between the sets
   /// and the other indicating if there are subset or disjoint set relationships
   function getDistanceMatrices(areas, sets, setids) {
       // initialize an empty distance matrix between all the points
       var distances = zerosM(sets.length, sets.length),
           constraints = zerosM(sets.length, sets.length);

       // compute required distances between all the sets such that
       // the areas match
       areas.filter(function(x) {
               return x.sets.length == 2;
           })
           .map(function(current) {
               var left = setids[current.sets[0]],
                   right = setids[current.sets[1]],
                   r1 = Math.sqrt(sets[left].size / Math.PI),
                   r2 = Math.sqrt(sets[right].size / Math.PI),
                   distance = distanceFromIntersectArea(r1, r2, current.size);

               distances[left][right] = distances[right][left] = distance;

               // also update constraints to indicate if its a subset or disjoint
               // relationship
               var c = 0;
               if (current.size + 1e-10 >= Math.min(sets[left].size,
                       sets[right].size)) {
                   c = 1;
               } else if (current.size <= 1e-10) {
                   c = -1;
               }
               constraints[left][right] = constraints[right][left] = c;
           });

       return {
           distances: distances,
           constraints: constraints
       };
   }

   /// computes the gradient and loss simulatenously for our constrained MDS optimizer
   function constrainedMDSGradient(x, fxprime, distances, constraints) {
       var loss = 0,
           i;
       for (i = 0; i < fxprime.length; ++i) {
           fxprime[i] = 0;
       }

       for (i = 0; i < distances.length; ++i) {
           var xi = x[2 * i],
               yi = x[2 * i + 1];
           for (var j = i + 1; j < distances.length; ++j) {
               var xj = x[2 * j],
                   yj = x[2 * j + 1],
                   dij = distances[i][j],
                   constraint = constraints[i][j];

               var squaredDistance = (xj - xi) * (xj - xi) + (yj - yi) * (yj - yi),
                   distance = Math.sqrt(squaredDistance),
                   delta = squaredDistance - dij * dij;

               if (((constraint > 0) && (distance <= dij)) ||
                   ((constraint < 0) && (distance >= dij))) {
                   continue;
               }

               loss += 2 * delta * delta;

               fxprime[2 * i] += 4 * delta * (xi - xj);
               fxprime[2 * i + 1] += 4 * delta * (yi - yj);

               fxprime[2 * j] += 4 * delta * (xj - xi);
               fxprime[2 * j + 1] += 4 * delta * (yj - yi);
           }
       }
       return loss;
   }

   /// takes the best working variant of either constrained MDS or greedy
   function bestInitialLayout(areas, params) {
       var initial = greedyLayout(areas, params);

       // greedylayout is sufficient for all 2/3 circle cases. try out
       // constrained MDS for higher order problems, take its output
       // if it outperforms. (greedy is aesthetically better on 2/3 circles
       // since it axis aligns)
       if (areas.length >= 8) {
           var constrained = constrainedMDSLayout(areas, params),
               constrainedLoss = lossFunction(constrained, areas),
               greedyLoss = lossFunction(initial, areas);

           if (constrainedLoss + 1e-8 < greedyLoss) {
               initial = constrained;
           }
       }
       return initial;
   }

   /// use the constrained MDS variant to generate an initial layout
   function constrainedMDSLayout(areas, params) {
       params = params || {};
       var restarts = params.restarts || 10;

       // bidirectionally map sets to a rowid  (so we can create a matrix)
       var sets = [],
           setids = {},
           i;
       for (i = 0; i < areas.length; ++i) {
           var area = areas[i];
           if (area.sets.length == 1) {
               setids[area.sets[0]] = sets.length;
               sets.push(area);
           }
       }

       var matrices = getDistanceMatrices(areas, sets, setids),
           distances = matrices.distances,
           constraints = matrices.constraints;

       // keep distances bounded, things get messed up otherwise.
       // TODO: proper preconditioner?
       var norm = norm2(distances.map(norm2)) / (distances.length);
       distances = distances.map(function(row) {
           return row.map(function(value) {
               return value / norm;
           });
       });

       var obj = function(x, fxprime) {
           return constrainedMDSGradient(x, fxprime, distances, constraints);
       };

       var best, current;
       for (i = 0; i < restarts; ++i) {
           var initial = zeros(distances.length * 2).map(Math.random);

           current = minimizeConjugateGradient(obj, initial, params);
           if (!best || (current.fx < best.fx)) {
               best = current;
           }
       }
       var positions = best.x;

       // translate rows back to (x,y,radius) coordinates
       var circles = {};
       for (i = 0; i < sets.length; ++i) {
           var set = sets[i];
           circles[set.sets[0]] = {
               x: positions[2 * i] * norm,
               y: positions[2 * i + 1] * norm,
               radius: Math.sqrt(set.size / Math.PI)
           };
       }

       if (params.history) {
           for (i = 0; i < params.history.length; ++i) {
               multiplyBy(params.history[i].x, norm);
           }
       }
       return circles;
   }

   /** Lays out a Venn diagram greedily, going from most overlapped sets to
   least overlapped, attempting to position each new set such that the
   overlapping areas to already positioned sets are basically right */
   function greedyLayout(areas) {
       // define a circle for each set
       var circles = {},
           setOverlaps = {},
           set;
       for (var i = 0; i < areas.length; ++i) {
           var area = areas[i];
           if (area.sets.length == 1) {
               set = area.sets[0];
               circles[set] = {
                   x: 1e10,
                   y: 1e10,
                   rowid: circles.length,
                   size: area.size,
                   radius: Math.sqrt(area.size / Math.PI)
               };
               setOverlaps[set] = [];
           }
       }
       areas = areas.filter(function(a) {
           return a.sets.length == 2;
       });

       // map each set to a list of all the other sets that overlap it
       for (i = 0; i < areas.length; ++i) {
           var current = areas[i];
           var weight = current.hasOwnProperty('weight') ? current.weight : 1.0;
           var left = current.sets[0],
               right = current.sets[1];

           // completely overlapped circles shouldn't be positioned early here
           if (current.size + SMALL >= Math.min(circles[left].size,
                   circles[right].size)) {
               weight = 0;
           }

           setOverlaps[left].push({
               set: right,
               size: current.size,
               weight: weight
           });
           setOverlaps[right].push({
               set: left,
               size: current.size,
               weight: weight
           });
       }

       // get list of most overlapped sets
       var mostOverlapped = [];
       for (set in setOverlaps) {
           if (setOverlaps.hasOwnProperty(set)) {
               var size = 0;
               for (i = 0; i < setOverlaps[set].length; ++i) {
                   size += setOverlaps[set][i].size * setOverlaps[set][i].weight;
               }

               mostOverlapped.push({
                   set: set,
                   size: size
               });
           }
       }

       // sort by size desc
       function sortOrder(a, b) {
           return b.size - a.size;
       }
       mostOverlapped.sort(sortOrder);

       // keep track of what sets have been laid out
       var positioned = {};

       function isPositioned(element) {
           return element.set in positioned;
       }

       // adds a point to the output
       function positionSet(point, index) {
           circles[index].x = point.x;
           circles[index].y = point.y;
           positioned[index] = true;
       }

       // add most overlapped set at (0,0)
       positionSet({
           x: 0,
           y: 0
       }, mostOverlapped[0].set);

       // get distances between all points. TODO, necessary?
       // answer: probably not
       // var distances = venn.getDistanceMatrices(circles, areas).distances;
       for (i = 1; i < mostOverlapped.length; ++i) {
           var setIndex = mostOverlapped[i].set,
               overlap = setOverlaps[setIndex].filter(isPositioned);
           set = circles[setIndex];
           overlap.sort(sortOrder);

           if (overlap.length === 0) {
               // this shouldn't happen anymore with addMissingAreas
               throw "ERROR: missing pairwise overlap information";
           }

           var points = [];
           for (var j = 0; j < overlap.length; ++j) {
               // get appropriate distance from most overlapped already added set
               var p1 = circles[overlap[j].set],
                   d1 = distanceFromIntersectArea(set.radius, p1.radius,
                       overlap[j].size);

               // sample positions at 90 degrees for maximum aesthetics
               points.push({
                   x: p1.x + d1,
                   y: p1.y
               });
               points.push({
                   x: p1.x - d1,
                   y: p1.y
               });
               points.push({
                   y: p1.y + d1,
                   x: p1.x
               });
               points.push({
                   y: p1.y - d1,
                   x: p1.x
               });

               // if we have at least 2 overlaps, then figure out where the
               // set should be positioned analytically and try those too
               for (var k = j + 1; k < overlap.length; ++k) {
                   var p2 = circles[overlap[k].set],
                       d2 = distanceFromIntersectArea(set.radius, p2.radius,
                           overlap[k].size);

                   var extraPoints = circleCircleIntersection({
                       x: p1.x,
                       y: p1.y,
                       radius: d1
                   }, {
                       x: p2.x,
                       y: p2.y,
                       radius: d2
                   });

                   for (var l = 0; l < extraPoints.length; ++l) {
                       points.push(extraPoints[l]);
                   }
               }
           }

           // we have some candidate positions for the set, examine loss
           // at each position to figure out where to put it at
           var bestLoss = 1e50,
               bestPoint = points[0];
           for (j = 0; j < points.length; ++j) {
               circles[setIndex].x = points[j].x;
               circles[setIndex].y = points[j].y;
               var loss = lossFunction(circles, areas);
               if (loss < bestLoss) {
                   bestLoss = loss;
                   bestPoint = points[j];
               }
           }

           positionSet(bestPoint, setIndex);
       }

       return circles;
   }

   /// Uses multidimensional scaling to approximate a first layout here
   //  function classicMDSLayout(areas) {
   //     // bidirectionally map sets to a rowid  (so we can create a matrix)
   //     var sets = [],
   //         setids = {};
   //     for (var i = 0; i < areas.length; ++i) {
   //         var area = areas[i];
   //         if (area.sets.length == 1) {
   //             setids[area.sets[0]] = sets.length;
   //             sets.push(area);
   //         }
   //     }

   //     // get the distance matrix, and use to position sets
   //     var distances = getDistanceMatrices(areas, sets, setids).distances;
   //     var positions = mds.classic(distances);

   //     // translate rows back to (x,y,radius) coordinates
   //     var circles = {};
   //     for (i = 0; i < sets.length; ++i) {
   //         var set = sets[i];
   //         circles[set.sets[0]] = {
   //             x: positions[i][0],
   //             y: positions[i][1],
   //             radius: Math.sqrt(set.size / Math.PI)
   //         };
   //     }
   //     return circles;
   // };

   /** Given a bunch of sets, and the desired overlaps between these sets - computes
   the distance from the actual overlaps to the desired overlaps. Note that
   this method ignores overlaps of more than 2 circles */
   function lossFunction(sets, overlaps) {
       var output = 0;

       function getCircles(indices) {
           return indices.map(function(i) {
               return sets[i];
           });
       }

       for (var i = 0; i < overlaps.length; ++i) {
           var area = overlaps[i],
               overlap;
           if (area.sets.length == 1) {
               continue;
           } else if (area.sets.length == 2) {
               var left = sets[area.sets[0]],
                   right = sets[area.sets[1]];
               overlap = circleOverlap(left.radius, right.radius,
                   distance(left, right));
           } else {
               overlap = intersectionArea(getCircles(area.sets));
           }

           var weight = area.hasOwnProperty('weight') ? area.weight : 1.0;
           output += weight * (overlap - area.size) * (overlap - area.size);
       }

       return output;
   }

   // orientates a bunch of circles to point in orientation
   function orientateCircles(circles, orientation) {
       // sort circles by size
       circles.sort(function(a, b) {
           return b.radius - a.radius;
       });

       var i;
       // shift circles so largest circle is at (0, 0)
       if (circles.length > 0) {
           var largestX = circles[0].x,
               largestY = circles[0].y;

           for (i = 0; i < circles.length; ++i) {
               circles[i].x -= largestX;
               circles[i].y -= largestY;
           }
       }

       // rotate circles so that second largest is at an angle of 'orientation'
       // from largest
       if (circles.length > 1) {
           var rotation = Math.atan2(circles[1].x, circles[1].y) - orientation,
               c = Math.cos(rotation),
               s = Math.sin(rotation),
               x, y;

           for (i = 0; i < circles.length; ++i) {
               x = circles[i].x;
               y = circles[i].y;
               circles[i].x = c * x - s * y;
               circles[i].y = s * x + c * y;
           }
       }

       // mirror solution if third solution is above plane specified by
       // first two circles
       if (circles.length > 2) {
           var angle = Math.atan2(circles[2].x, circles[2].y) - orientation;
           while (angle < 0) {
               angle += 2 * Math.PI;
           }
           while (angle > 2 * Math.PI) {
               angle -= 2 * Math.PI;
           }
           if (angle > Math.PI) {
               var slope = circles[1].y / (1e-10 + circles[1].x);
               for (i = 0; i < circles.length; ++i) {
                   var d = (circles[i].x + slope * circles[i].y) / (1 + slope * slope);
                   circles[i].x = 2 * d - circles[i].x;
                   circles[i].y = 2 * d * slope - circles[i].y;
               }
           }
       }
   }

   function disjointCluster(circles) {
       // union-find clustering to get disjoint sets
       circles.map(function(circle) {
           circle.parent = circle;
       });

       // path compression step in union find
       function find(circle) {
           if (circle.parent !== circle) {
               circle.parent = find(circle.parent);
           }
           return circle.parent;
       }

       function union(x, y) {
           var xRoot = find(x),
               yRoot = find(y);
           xRoot.parent = yRoot;
       }

       // get the union of all overlapping sets
       for (var i = 0; i < circles.length; ++i) {
           for (var j = i + 1; j < circles.length; ++j) {
               var maxDistance = circles[i].radius + circles[j].radius;
               if (distance(circles[i], circles[j]) + 1e-10 < maxDistance) {
                   union(circles[j], circles[i]);
               }
           }
       }

       // find all the disjoint clusters and group them together
       var disjointClst = {},
           setid;
       for (i = 0; i < circles.length; ++i) {
           setid = find(circles[i]).parent.setid;
           if (!(setid in disjointClst)) {
               disjointClst[setid] = [];
           }
           disjointClst[setid].push(circles[i]);
       }

       // cleanup bookkeeping
       circles.map(function(circle) {
           delete circle.parent;
       });

       // return in more usable form
       var ret = [];
       for (setid in disjointClst) {
           if (disjointClst.hasOwnProperty(setid)) {
               ret.push(disjointClst[setid]);
           }
       }
       return ret;
   }

   function getBoundingBox(circles) {
       var minMax = function(d) {
           var hi = Math.max.apply(null, circles.map(
                   function(c) {
                       return c[d] + c.radius;
                   })),
               lo = Math.min.apply(null, circles.map(
                   function(c) {
                       return c[d] - c.radius;
                   }));
           return {
               max: hi,
               min: lo
           };
       };

       return {
           xRange: minMax('x'),
           yRange: minMax('y')
       };
   }

   function normalizeSolution(solution, orientation) {
       orientation = orientation || Math.PI / 2;

       // work with a list instead of a dictionary, and take a copy so we
       // don't mutate input
       var circles = [],
           i, setid;
       for (setid in solution) {
           if (solution.hasOwnProperty(setid)) {
               var previous = solution[setid];
               circles.push({
                   x: previous.x,
                   y: previous.y,
                   radius: previous.radius,
                   setid: setid
               });
           }
       }

       // get all the disjoint clusters
       var clusters = disjointCluster(circles);

       // orientate all disjoint sets, get sizes
       for (i = 0; i < clusters.length; ++i) {
           orientateCircles(clusters[i], orientation);
           var bounds = getBoundingBox(clusters[i]);
           clusters[i].size = (bounds.xRange.max - bounds.xRange.min) * (bounds.yRange.max - bounds.yRange.min);
           clusters[i].bounds = bounds;
       }
       clusters.sort(function(a, b) {
           return b.size - a.size;
       });

       // orientate the largest at 0,0, and get the bounds
       circles = clusters[0];
       var returnBounds = circles.bounds;

       var spacing = (returnBounds.xRange.max - returnBounds.xRange.min) / 50;

       function addCluster(cluster, right, bottom) {
           if (!cluster) return;

           var bounds = cluster.bounds,
               xOffset, yOffset, centreing;

           if (right) {
               xOffset = returnBounds.xRange.max - bounds.xRange.min + spacing;
           } else {
               xOffset = returnBounds.xRange.max - bounds.xRange.max - spacing;
               centreing = (bounds.xRange.max - bounds.xRange.min) / 2 -
                   (returnBounds.xRange.max - returnBounds.xRange.min) / 2;
               if (centreing < 0) xOffset += centreing;
           }

           if (bottom) {
               yOffset = returnBounds.yRange.max - bounds.yRange.min + spacing;
           } else {
               yOffset = returnBounds.yRange.max - bounds.yRange.max - spacing;
               centreing = (bounds.yRange.max - bounds.yRange.min) / 2 -
                   (returnBounds.yRange.max - returnBounds.yRange.min) / 2;
               if (centreing < 0) yOffset += centreing;
           }

           for (var j = 0; j < cluster.length; ++j) {
               cluster[j].x += xOffset;
               cluster[j].y += yOffset;
               circles.push(cluster[j]);
           }
       }

       var index = 1;
       while (index < clusters.length) {
           addCluster(clusters[index], true, false);
           addCluster(clusters[index + 1], false, true);
           addCluster(clusters[index + 2], true, true);
           index += 3;

           // have one cluster (in top left). lay out next three relative
           // to it in a grid
           returnBounds = getBoundingBox(circles);
       }

       // convert back to solution form
       var ret = {};
       for (i = 0; i < circles.length; ++i) {
           ret[circles[i].setid] = circles[i];
       }
       return ret;
   }

   /** Scales a solution from venn.venn or venn.greedyLayout such that it fits in
   a rectangle of width/height - with padding around the borders. also
   centers the diagram in the available space at the same time */
   function scaleSolution(solution, width, height, padding) {
       var circles = [],
           setids = [];
       for (var setid in solution) {
           if (solution.hasOwnProperty(setid)) {
               setids.push(setid);
               circles.push(solution[setid]);
           }
       }

       width -= 2 * padding;
       height -= 2 * padding;

       var bounds = getBoundingBox(circles),
           xRange = bounds.xRange,
           yRange = bounds.yRange,
           xScaling = width / (xRange.max - xRange.min),
           yScaling = height / (yRange.max - yRange.min),
           scaling = Math.min(yScaling, xScaling),

           // while we're at it, center the diagram too
           xOffset = (width - (xRange.max - xRange.min) * scaling) / 2,
           yOffset = (height - (yRange.max - yRange.min) * scaling) / 2;

       var scaled = {};
       for (var i = 0; i < circles.length; ++i) {
           var circle = circles[i];
           scaled[setids[i]] = {
               radius: scaling * circle.radius,
               x: padding + xOffset + (circle.x - xRange.min) * scaling,
               y: padding + yOffset + (circle.y - yRange.min) * scaling,
           };
       }

       return scaled;
   }

   function circleMargin(current, interior, exterior) {
       var margin = interior[0].radius - distance(interior[0], current),
           i, m;
       for (i = 1; i < interior.length; ++i) {
           m = interior[i].radius - distance(interior[i], current);
           if (m <= margin) {
               margin = m;
           }
       }

       for (i = 0; i < exterior.length; ++i) {
           m = distance(exterior[i], current) - exterior[i].radius;
           if (m <= margin) {
               margin = m;
           }
       }
       return margin;
   }

   // compute the center of some circles by maximizing the margin of
   // the center point relative to the circles (interior) after subtracting
   // nearby circles (exterior)
   function computeTextCentre(interior, exterior) {
       // get an initial estimate by sampling around the interior circles
       // and taking the point with the biggest margin
       var points = [],
           i;
       for (i = 0; i < interior.length; ++i) {
           var c = interior[i];
           points.push({
               x: c.x,
               y: c.y
           });
           points.push({
               x: c.x + c.radius / 2,
               y: c.y
           });
           points.push({
               x: c.x - c.radius / 2,
               y: c.y
           });
           points.push({
               x: c.x,
               y: c.y + c.radius / 2
           });
           points.push({
               x: c.x,
               y: c.y - c.radius / 2
           });
       }
       var initial = points[0],
           margin = circleMargin(points[0], interior, exterior);
       for (i = 1; i < points.length; ++i) {
           var m = circleMargin(points[i], interior, exterior);
           if (m >= margin) {
               initial = points[i];
               margin = m;
           }
       }

       // maximize the margin numerically
       var solution = fmin(
           function(p) {
               return -1 * circleMargin({
                   x: p[0],
                   y: p[1]
               }, interior, exterior);
           }, [initial.x, initial.y], {
               maxIterations: 500,
               minErrorDelta: 1e-10
           }).solution;
       var ret = {
           x: solution[0],
           y: solution[1]
       };

       // check solution, fallback as needed (happens if fully overlapped
       // etc)
       var valid = true;
       for (i = 0; i < interior.length; ++i) {
           if (distance(ret, interior[i]) > interior[i].radius) {
               valid = false;
               break;
           }
       }

       for (i = 0; i < exterior.length; ++i) {
           if (distance(ret, exterior[i]) < exterior[i].radius) {
               valid = false;
               break;
           }
       }

       if (!valid) {
           if (interior.length == 1) {
               ret = {
                   x: interior[0].x,
                   y: interior[0].y
               };
           } else {
               var areaStats = {};
               intersectionArea(interior, areaStats);

               if (areaStats.arcs.length === 0) {
                   ret = {
                       'x': 0,
                       'y': -1000,
                       disjoint: true
                   };

               } else if (areaStats.arcs.length == 1) {
                   ret = {
                       'x': areaStats.arcs[0].circle.x,
                       'y': areaStats.arcs[0].circle.y
                   };

               } else if (exterior.length) {
                   // try again without other circles
                   ret = computeTextCentre(interior, []);

               } else {
                   // take average of all the points in the intersection
                   // polygon. this should basically never happen
                   // and has some issues:
                   // https://github.com/benfred/venn.js/issues/48#issuecomment-146069777
                   ret = getCenter(areaStats.arcs.map(function(a) {
                       return a.p1;
                   }));
               }
           }
       }

       return ret;
   }


   // given a dictionary of {setid : circle}, returns
   // a dictionary of setid to list of circles that completely overlap it
   function getOverlappingCircles(circles) {
       var ret = {},
           circleids = [];
       for (var circleid in circles) {
           circleids.push(circleid);
           ret[circleid] = [];
       }
       for (var i = 0; i < circleids.length; i++) {
           var a = circles[circleids[i]];
           for (var j = i + 1; j < circleids.length; ++j) {
               var b = circles[circleids[j]],
                   d = distance(a, b);

               if (d + b.radius <= a.radius + 1e-10) {
                   ret[circleids[j]].push(circleids[i]);

               } else if (d + a.radius <= b.radius + 1e-10) {
                   ret[circleids[i]].push(circleids[j]);
               }
           }
       }
       return ret;
   }

   function computeTextCentres(circles, areas) {
       var ret = {},
           overlapped = getOverlappingCircles(circles);
       for (var i = 0; i < areas.length; ++i) {
           var area = areas[i].sets,
               areaids = {},
               exclude = {};
           for (var j = 0; j < area.length; ++j) {
               areaids[area[j]] = true;
               var overlaps = overlapped[area[j]];
               // keep track of any circles that overlap this area,
               // and don't consider for purposes of computing the text
               // centre
               for (var k = 0; k < overlaps.length; ++k) {
                   exclude[overlaps[k]] = true;
               }
           }

           var interior = [],
               exterior = [];
           for (var setid in circles) {
               if (setid in areaids) {
                   interior.push(circles[setid]);
               } else if (!(setid in exclude)) {
                   exterior.push(circles[setid]);
               }
           }
           var centre = computeTextCentre(interior, exterior);
           ret[area] = centre;
           if (centre.disjoint && (areas[i].size > 0)) {
               console.log("WARNING: area " + area + " not represented on screen");
           }
       }
       return ret;
   }

   function circlePath(x, y, r) {
       var ret = [];
       ret.push("\nM", x, y);
       ret.push("\nm", -r, 0);
       ret.push("\na", r, r, 0, 1, 0, r * 2, 0);
       ret.push("\na", r, r, 0, 1, 0, -r * 2, 0);
       return ret.join(" ");
   }

   /** returns a svg path of the intersection area of a bunch of circles */
   function intersectionAreaPath(circles) {
       var stats = {};
       intersectionArea(circles, stats);
       var arcs = stats.arcs;

       if (arcs.length === 0) {
           return "M 0 0";

       } else if (arcs.length == 1) {
           var circle = arcs[0].circle;
           return circlePath(circle.x, circle.y, circle.radius);

       } else {
           // draw path around arcs
           var ret = ["\nM", arcs[0].p2.x, arcs[0].p2.y];
           for (var i = 0; i < arcs.length; ++i) {
               var arc = arcs[i],
                   r = arc.circle.radius,
                   wide = arc.width > r;
               ret.push("\nA", r, r, 0, wide ? 1 : 0, 1,
                   arc.p1.x, arc.p1.y);
           }
           return ret.join(" ");
       }
   }

   function venn$1() {
     // d3.layout.venn = function() {

     var opts = {
       sets: null,
       setsAccessor: setsAccessorFn,
       setsSize: setsSize,
       packingStragegy: pack,
       packingConfig: {
         value: valueFn,
       },
       size: [1, 1],
       padding: 15,

       // options from venn (https://github.com/benfred/venn.js)
       layoutFunction: venn$2,
       orientation: Math.PI / 2,
       normalize: true

     };

     var circles,
       nodes,
       packer,
       centres;


     // Build simple getter and setter Functions
     binder(venn, opts);

     //The layout function
     function venn(data) {
       if (!arguments.length) return nodes;
        nodes = compute(data);
        return venn;
     }



     function compute(data) {
       var sets = venn.sets(),
           setsValues,
         layout = venn.layoutFunction(),
         packingStragegy = venn.packingStragegy(),
         size = venn.size(),
         width = size[0],
         height = size[1],
         // normalizeSolution = normalizeSolution,
         // scaleSolution = scaleSolution,
         // computeTextCentres = computeTextCentres,

         solution,
         oldCircles;


       sets = extractSets(data);
       setsValues = sets.values()
       solution = layout(setsValues);

	   

       console.info("data: ", data)
       console.info("sets: ", sets)

       if (venn.normalize()) {
         solution = normalizeSolution(solution, venn.orientation());
       }

       oldCircles = circles;
       circles = scaleSolution(solution, width, height, venn.padding());

       for (var k in oldCircles) {
         if (circles[k]) {
           circles[k].previous = oldCircles[k];
         }
       }
       oldCircles = null;

       centres = computeTextCentres(circles, setsValues);

       // store intersectionAreaPath into sets
       sets.forEach(function(k,set) {
         set.d = pathTween(set);
         set.center = centres[k];
         set.innerRadius = computeDistanceToCircles(set);
         // packingStragegy(set, valueFunction, circles);
       });

       packer = packingStragegy(venn, data)

       function computeDistanceToCircles(set) {
         var sets = set.sets,
           center = set.center,
           // hasOneSet = set.length ==1,
           k, circle, dist, isInside, isOverlapp,
           candidate = Infinity;
         // if(sets.length ==1)  {
         for (k in circles) {
           circle = circles[k];
           isInside = sets.indexOf(k) > -1;
           isOverlapp = sets.indexOf(k) < -1 && checkOverlapp(sets, circle);
           dist = distance(center, circle);
           dist = isInside ? circle.radius - dist : isOverlapp ? dist - circle.radius : dist + circle.radius;
           if (dist < candidate) {
             candidate = dist;
           }

         }
         return candidate;
       }

       function checkOverlapp(sets, circle) {
         var i = 0,
           l = sets.length,
           c;
         for (i; i < l; i++) {
           c = circles[sets[i]];
           if (distance(c, circle) < c.radius) {
             return true;
           }
         }
         return false;
       }
       // interpolate intersection area paths between previous and
       // current paths
       function pathTween(set) {
         return function(t) {
           var c = set.sets.map(function(set) {
             // var start = previous[set],
             var circle = circles[set];

             var start = circle && circle["previous"],
               end = circle;
             if (!start) {
               start = {
                 x: width / 2,
                 y: height / 2,
                 radius: 1
               };
             }
             if (!end) {
               end = {
                 x: width / 2,
                 y: height / 2,
                 radius: 1
               };
             }
             if (t == 1 && circle) {
               circle["previous"] = end;
             }
             return {
               'x': start.x * (1 - t) + end.x * t,
               'y': start.y * (1 - t) + end.y * t,
               'radius': start.radius * (1 - t) + end.radius * t
             };
           });

           return intersectionAreaPath(c);
         };
       };
       return data
     }

     // loop over data and build the set so that they comply with https://github.com/benfred/venn.js
     /*
     from  data = [
         {"set":["A"],"name":"node_0"},
         {"set":["B"],"name":"node_1"},
         {"set":["B","A"],"name":"node_2"}
         {"set":["B","A"],"name":"node_3"}
         ]

     to sets = [ 
         {sets: ['A'], size: 1, nodes : ['node_0']}, 
         {sets: ['B'], size: 1, nodes : ['node_1']},
         {sets: ['A','B'], size: 2, nodes ['node_2', 'node_3']}
         ];
     */
     function extractSets(data) {
	 
       var sets = d3.map({}, function(d) {
           return d.__key__
         }),
         individualSets = d3.map(),
         accessor = venn.setsAccessor(),
         size = venn.setsSize(),
         set,
         s,
         key,
         i,
         n = data.length;

       for (i = -1; ++i < n;) {
         set = accessor(data[i]);
         if (set.length) {
           key = set.sort().join(','); //so taht we have the same key as in https://github.com/benfred/venn.js
           set.forEach(function(val) {
             if (s = individualSets.get(val)) {
               s.size += 1;
               // s.nodes.push([data[i]]);

             } else {
               individualSets.set(val, {
                 __key__: val,
                 size: 1,
                 sets: [val],
                 nodes: []
                   // nodes: [data[i]]
               })
             }
           });
           data[i].__setKey__ = key;
           if (s = sets.get(key)) {
             s.size++;
             s.nodes.push(data[i]);
           } else {
             sets.set(key, {
               __key__: key,
               sets: set,
               size: 1,
               nodes: [data[i]]
             });
           }
         }

       }
       individualSets.forEach(function(k, v) {
         if (!sets.get(k)) {
           sets.set(k, v);
         }
       });
       // reset the size for each set. 
       sets.forEach(function(k, v) {
         v.size = size(v.size);
       })
       // sets = sets.values();

       venn.sets(sets);

       return sets;
     }

     function setsSize(size) {
       return size;
     }

     // data accessors 
     function setsAccessorFn(d) {
       return d.set || [];
     }

     function valueFn(d) {
       return d.value;
     }
     venn.packingConfig = function(_) {
       var config = opts.packingConfig;
       if (!arguments.length) {
         return config;
       }
       for (var k in _) {
         config[k] = _[k]
       }
       if(packer) {
           applier(packer, _)
       }
       return venn;

     };

     venn.packer = function() {
       return packer;
     }

     venn.circles = function() {
       return circles;
     };

     venn.centres = function() {
       return centres;
     };

     venn.nodes = venn;

     return venn;
     // return d3.rebind(venn, event, "on");
   };

   var version = "0.0.9";

   exports.version = version;
   exports.venn = venn$1;
   exports.pack = pack;
   exports.distribute = distribute;
   exports.force = force;

}));(function(target, cname, name) {
  if (target) {
    target[name] = this[cname] && this[cname][name];

    for (var k in this[cname]) {
      if (k != name) {
        target[name][k] = this[cname][k];
      }
    }
    delete this[cname];
  }
}(this.d3 && this.d3.layout, 'd3_venn', 'venn'));