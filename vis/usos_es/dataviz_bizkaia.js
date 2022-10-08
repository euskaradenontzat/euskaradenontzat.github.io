//Prepare canvas size
isSmall = innerWidth < 350;
isMobile = innerWidth < 758;

var screenwidth = d3.select("#vis3").node().clientWidth;

// set the dimensions and margins of the graph
// Margin convention: https://bl.ocks.org/mbostock/3019563
var margin = {top: 50, right: 10, bottom: 10, left:0},
    width = (isSmall ? (screenwidth*1.5) : screenwidth) - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var vis3 = d3.select("#vis3");
var chartWidth = width/6; //change this depending on number of varables

// language
var becasMaterial = "% Becas material escolar",
becasComedor = "% Becas comedor",
alumnadoExtranjero = "% alumnado extranjero",
hablaeuskera = "Habla euskera %",
puestoslegales ="Puestos con perfiles<br>lingüísticos obligatorios<br>(% legal)",
puestosreales ="Puestos con perfiles<br>lingüísticos obligatorios<br>(% práctica):",
privadoConcertado = "privado-concertado";
	
if (lengua == "eu" ) {
  var becasMaterial = "Material didaktikoko beken %",
	becasComedor = "Jantokiko beken %";
	alumnadoExtranjero = "Atzerriko ikasleen %",
	publico = "publikoa",
	privadoConcertado = "pribatu-itunpekoa";
}

// sets scales
var x = d3.scale.ordinal().rangePoints([0, width], 1);
var y = d3.scale.linear()
		.range([height, 0])
		.domain([0,50]);
var dragging = {};

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    background,
    foreground;

var svg3 = d3.select("#vis3").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate("+ margin.left +"," + margin.top + ")");
    
var tooltip = d3.select("body").append("div") 
		.attr("class", "tooltip2")

//replaces spaces and .
var replacement2 = function(d) { return d.replace(/\s+/g, '').replace(/\.+/g, '').replace(/\,+/g, '').replace(/[{()}]/g, '').replace(/\-+/g, '').replace(/\//g, '').toLowerCase();};

//Legends
var legend3 = d3.select("#legend3");
var zona3 = d3.select("#zona3");

d3.tsv("data/municipios_bizkaia.tsv", function(error, zonas3) {

  // Extract the list of dimensions and create a scale for each.
  x.domain(dimensions = d3.keys(zonas3[0]).filter(function(d) {
    return d != "zona" && d != "provincia" && d != "zona_id" && d != "poblacion" && d != "tamaño" && d != "tamano2" && (y[d] = d3.scale.linear() //removes from chart variables
        .domain(d3.extent(zonas3, function(p) { return +p[d]; }))
        .range([height, 0]));
  }));

  // Add grey background lines for context.
  background = svg3.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(zonas3)
    .enter().append("path")
      .attr("d", path)
      .attr("fill","none")
      .attr("stroke","#AAA")
			.attr("class",function(d) { return replacement2(d.zona);} );
			
  // Add foreground lines for focus.
  foreground = svg3.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(zonas3)
    .enter().append("path")
      .attr("d", path)
      .attr("class",function(d) { return replacement2(d.zona ) + " todos " + d.tamano2;} ) // colorea líneas según color de provincia
      .attr("stroke", function(d) { return d.tamaño == "c. Menos de 5.001" ? "#fdbe85" : d.tamaño == "b. De 5.001 a 10.000" ? "#beaed4" : d.tamaño == "a. Más de 10.000" ? "#2ca25f" : "#666"; })
      .attr("fill","none")
      .attr("stroke-width","1.7px")
      .attr("id",function(d) { return replacement2(d.zona);} ) // colorea líneas según color de provincia
      .on("mousemove", showTooltip) // AÑADIR EVENTO SHOW TOOLTIP
			.on("mouseout", hideTooltip); // OCULTAR TOOLTIP

  // Add a group element for each dimension.
  var g3 = svg3.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

	// Add rectangles to hide not interesting paths
	/*
  g.append("rect")
		.attr("y", 0 )
		.attr("height", height)
		.attr("x", 0)
		.attr("width", chartWidth)
		.attr("fill","#FFFFFF")
		.attr("class", function(d) { return d; });
		*/

  // Add an axis and title.
  g3.append("g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    .append("text")
      .style("text-anchor", "middle")
      .attr("class","axis_title")
      .attr("y", -9)
      .text(function(d) { return d; });

  // Add and store a brush for each axis.
  if ( !isMobile ) { // makes brush only work for non mobile devices
  g3.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
	}

// rótulos secciones
	svg3.append("text")
		.attr("x", chartWidth*3)
		.attr("y", -margin.top/1.3)
		.text("Bizkaia")
		//.text(becasMaterial)
		.attr("class", "axistitle")
		.style("text-anchor", "middle")
		.attr("font-size", "14px")
		.attr("fill", "black")
		.attr("font-weight", "bold");

// rótulos ejes
	svg3.append("text")
		.attr("x", chartWidth)
		.attr("y", -margin.top/2.5)
		.text("habla")
		.attr("class","axis_label");
	svg3.append("text")
		.attr("x", chartWidth)
		.attr("y", -margin.top/7)
		.text("euskera %")
		.attr("class","axis_label");
		
	svg3.append("text")
		.attr("x", chartWidth*3)
		.attr("y", -margin.top/2.5)
		.text("% perfiles ")
		.attr("class","axis_label");
	svg3.append("text")
		.attr("x", chartWidth*3)
		.attr("y", -margin.top/7)
		.text("legales")
		.attr("class","axis_label");
		
	svg3.append("text")
		.attr("x", chartWidth*5)
		.attr("y", -margin.top/2.5)
		.text("% perfiles")
		.attr("class","axis_label");
	svg3.append("text")
		.attr("x", chartWidth*5)
		.attr("y", -margin.top/7)
		.text("práctica")
		.attr("class","axis_label");
		
	function showTooltip(d) {
		// Fill the tooltip
		tooltip.html(
			"<div class='table-responsive'><h4><strong>" + d.zona + "</strong> (Población: " + d.poblacion + ", " + d.provincia[0].toUpperCase() + d.provincia.substring(1) + ")</h4>" +
					"<table class='table table-condensed table-striped'><thead><tr><td>" + hablaeuskera + "</td><td style='text-align:right'><b>" + d.habitual_euskera_per + "%</b> </td></tr><tr><td>" + puestoslegales + "</td><td style='text-align:right'><b>" + d.puestos_normativa_per+ "%</b> </td></tr><tr><td>" + puestosreales + "</td>" +
					"<td style='text-align:right'><b>" + d.puestos_practica_per+ "%</b> </td></tr>" +
					
						/*		"<div class='table-responsive'><h4><strong>" + d.zona + "</strong> (Población: " + d.poblacion + ", " + d.provincia + ")</h4>" +
					"<table class='table table-condensed table-striped'><thead><tr><td>" + hablaeuskera + "</td><td>" + puestoslegales + "</td><td>" + puestosreales + "</td></tr></thead>" +
					"<tbody><tr><td style='text-align:right'>" + d.habitual_euskera_per + "% </td><td style='text-align:right'>" + d.puestos_normativa_per+ "% </td><td style='text-align:right'>" + d.puestos_practica_per+ "% </td></tr>" +*/
					//"</tbody>" +
			"</table></div>")
			.style("opacity", 1)

		tooltip.style("left", (d3.event.pageX)+55 + "px")
		tooltip.style("top", (d3.event.pageY)-155 + "px")
	}
	function hideTooltip(d) {
		// Hide tooltip
		tooltip.style("opacity", 0)
	}

	// Selecciona zona (dropdown menu)
	legend3.selectAll('div')
	
	legend3.selectAll('div')
		.data(zonas3)
		.enter().append("li").append("a")
		.attr("class", function(d) { return "inactive " + replacement2(d.zona);})
		.attr("id", function(d) { return "id" + replacement2(d.zona);})
		.text(function(d) { return d.zona;})
		.on('click',function(d) { //when click on name
			legend3.select('.btn-activo').attr('class','inactive');
			svg3.selectAll('svg .foreground path').style("visibility","hidden").attr("stroke-width","1.5px");
			svg3.selectAll('svg .foreground path.'+ replacement2(d.zona))
				.style("opacity",1)
				.style("visibility","visible").attr("stroke-width","1.5px"); //selecciona path que coincide con la zona seleccionada
			d3.select(this).attr("class","btn-activo"); //adds class success to button
			if ( d.zona3 == "Todos") {
				zona3.select("p").html("<strong>Todos los municipios</strong>");
			} else if ( d.perc_alum_ext_priv == "") {
				zona3.select("p").html("<strong>"+d.zona+"</strong>. No hay centros privados en esta zona");
			} else {
				zona3.select("p").html("<strong>"+d.zona+"</strong>"); //write in description
			}
		});
});

function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}

function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
  var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
      extents = actives.map(function(p) { return y[p].brush.extent(); });
  foreground.style("display", function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? null : "none";
  });
}
