const offset = 10;
const pixel = 1;
const resolution = 240;
const aspectRatio = 16/9;
const layers = [
	'base'
];
const colorScale = d3.scaleSequential().domain([1, 0]).interpolator(d3.interpolateInferno);
const xScope = (s) => s*aspectRatio;
const yScope = (s) => s;

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
var cx;
var cy;
var scope;
var pan;

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

function changeScale(){
	xScale = d3.scaleLinear()
	.domain([0,w])
	.range([cx-xScope(scope), cx+xScope(scope)]);

	yScale = d3.scaleLinear()
	.domain([0,h])
	.range([cy-yScope(scope), cy+yScope(scope)]);

	render();
}

function getPixelColor(d){
	return colorScale(mandel(xScale(d.x), yScale(d.y)));
}

function render(){
	pixels.style('fill', getPixelColor);
}

function handleClickZoom(){
	var [x,y] = d3.mouse(this);
	if(x<0||y<0||x>=w*pixel||y>=h*pixel)
		return;
	cx = xScale(x);
	cy = yScale(y);
	scope /= 2;
	changeScale();
}

function handlePanAndZoom(dx, dy, z = 1){
	cx += dx*pan*xScope(scope);
	cy += dy*pan*yScope(scope);
	scope *= z;
	changeScale();
}

function setPanFraction(k){
	k = parseInt(k);
	if(k==NaN) return;
	pan = k/10;
}

function handleKeyPress(e){
	switch(e.key){
		case 'ArrowRight':
			handlePanAndZoom(1,0);
			break;
		case 'ArrowDown':
			handlePanAndZoom(0,1);
			break;
		case 'ArrowLeft':
			handlePanAndZoom(-1,0);
			break;
		case 'ArrowUp':
			handlePanAndZoom(0,-1);
			break;
		case 'i':
		case 'I':
			handlePanAndZoom(0,0,0.5);
			break;
		case 'o':
		case 'O':
			handlePanAndZoom(0,0,2);
			break;
		case 'r':
		case 'R':
			iter += 25;
			render();
			break;
		case 'z':
		case 'Z':
			scope = 1.5;
			changeScale();
			break;
		default:
			setPanFraction(e.key);
	}
}

function init(){
	// set height and width of the svg element
	width = window.innerWidth - 2*offset;
	height = window.innerHeight - 2*offset;

	svg = d3.select("svg")
	.attr("width", width).attr("height", height)
	.attr("x", offset).attr("y", offset)
	.on('click', handleClickZoom);

	// add layers to the svg
	layer = {};
	for(var i of layers){
		layer[i] = svg.append('g');
	}

	// init data based on size
	w = Math.floor(resolution*aspectRatio);
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
	cx = cy = 0;
	scope = 1.5;
	iter = 25;
	setPanFraction(3);
	handlePanAndZoom(0,0);

	window.onkeydown = handleKeyPress;
}

init();
