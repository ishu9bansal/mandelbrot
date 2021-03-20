const offset = 10;
const pixel = 2;
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
var w;
var h;

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
	.attr("x", offset).attr("y", offset)
	.on('click', render);

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

	// set up scales
	changeScale(0,0,2.1);
}

init();
