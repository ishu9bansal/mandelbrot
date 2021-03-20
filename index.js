const offset = 10;
const pixel = 2;
const resolution = 240;
const aspectRation = 16/9;
const layers = [
	'base'
];
const colorScale = d3.scaleSequential().domain([0, 1]).interpolator(d3.interpolateInferno);

var data;
var svg;
var width;
var height;
var layer;
var pixels;

function getPixelColor(d){
	return colorScale(Math.random());
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
	var w = Math.floor(resolution*aspectRation);
	var h = Math.floor(resolution);
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
	// .style('stroke', 'white')
	.style('fill', 'grey');

	pixels = layer['base'].selectAll('rect.pixel');
}

init();
