const offset = 10;
const pixel = 1;
const resolution = 240;
const aspectRation = 16/9;
const layers = [
	'base'
];
const colorScale = d3.scaleSequential().domain([1, 0]).interpolator(d3.interpolateInferno);

var data;
var svg;
var width;
var height;
var layer;
var pixels;
var xScale;
var yScale;
var iter;
var w;
var h;

// core method
function mandel(x0,y0){
	var x = 0;
	var y = 0;
	var i = 0;
	while(x*x+y*y<4 && i<iter){
		i++;
		[x,y] = [x*x - y*y + x0, 2*x*y + y0];
	}
	return i/iter;
}

function changeScale(cx, cy, scope){
	xScale = d3.scaleLinear()
	.domain([0,w])
	.range([cx-scope*aspectRation, cx+scope*aspectRation]);

	yScale = d3.scaleLinear()
	.domain([0,h])
	.range([cy-scope, cy+scope]);

	render();
}

function getPixelColor(d){
	return colorScale(mandel(xScale(d.x), yScale(d.y)));
}

function render(){
	pixels.style('fill', getPixelColor);
}

function init(){
	// set height and width of the svg element
	width = window.innerWidth - 2*offset;
	height = window.innerHeight - 2*offset;

	svg = d3.select("svg")
	.attr("width", width).attr("height", height)
	.attr("x", offset).attr("y", offset);

	// add layers to the svg
	layer = {};
	for(var i of layers){
		layer[i] = svg.append('g');
	}

	// init data based on size
	w = Math.floor(resolution*aspectRation);
	h = Math.floor(resolution);
	var n = w*h;
	data = [];
	for(var i=0; i<n; i++){
		data.push({
			x: i%w,
			y: Math.floor(i/w)
		});
	}

	// init all pixels
	layer['base'].selectAll('rect.pixel')
	.data(data).enter().append('rect')
	.classed('pixel', true)
	.attr('x', d => d.x*pixel).attr('y', d => d.y*pixel)
	.attr('width', pixel).attr('height', pixel)
	.style('fill', 'grey');

	pixels = layer['base'].selectAll('rect.pixel');

	// set up initial scales, and iterations
	iter = 50;
	changeScale(0,0,1.5);
}

init();
