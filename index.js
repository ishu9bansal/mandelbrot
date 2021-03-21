const offset = 10;
const pixel = 1;
const resolution = 480;
const aspectRatio = 16/9;
const globalColorScale = d3.scaleSequential().domain([1,0]).interpolator(d3.interpolateInferno);
const xScope = (s) => s*aspectRatio;
const yScope = (s) => s;
const GLOBAL = 'global';
const LOCAL = 'local';
const FIXED = 'fixed';

var data;
var canvas;
var context;
var width;
var height;
var pixels;
var xScale;
var yScale;
var iter;
var w;
var h;
var cx;
var cy;
var scope;
var colorScale;
var colorScheme;

// core method
function chaos(x0,y0){
	var r = x0;
	var x = y0;
	var i = iter;
	while(i--){
		x = r*x*(1-x);
	}
	return x;
}

function recalculateColorScheme(){
	if(colorScheme==GLOBAL){
		colorScale = globalColorScale;
	}
	else if(colorScheme==LOCAL){
		colorScale = d3.scaleSequential()
		.domain([d3.max(data, d => d.v), d3.min(data, d => d.v)])
		.interpolator(d3.interpolateInferno);
	}
}

function calculate(){
	data.forEach(function(d){
		d.v = Math.floor(yScale.invert(chaos(xScale(d.x), yScale(d.y))));
	});
}

function render(){
	data.forEach(function(d){
		context.fillStyle = 'black';
		context.fillRect(pixel*d.x, pixel*d.y, pixel, pixel);
	});
	data.forEach(function(d){
		context.fillStyle = 'white';
		context.fillRect(pixel*d.x, pixel*d.v, pixel, pixel);
	});
}

function draw(){
	// set view port to the coordinates and scale
	xScale = d3.scaleLinear()
	.domain([0,w])
	.range([cx-scope, cx+scope]);

	yScale = d3.scaleLinear()
	.domain([0,h])
	.range([1,0]);

	// recalculate pixel info
	calculate();

	// recalculate color scheme if needed
	recalculateColorScheme();

	// render based on the color scheme
	render();
}

function handleClickZoom(){
	var [x,y] = d3.mouse(this);
	if(x<0||y<0||x>=w*pixel||y>=h*pixel){
		changeControls(controlButtons.zoomOut);
	}
	else{
		cx = xScale(x);
		cy = yScale(y);
		changeControls(controlButtons.zoomIn);
	}
}

function handleControl(control){
	cx = control.cx;
	cy = control.cy;
	scope = control.scope;
	iter = control.iter;
	colorScheme = control.colorScheme;
	draw();
}

function changeControls(methods){
	if(!methods) return;
	control = {
		cx: cx,
		cy: cy,
		scope: scope,
		iter: iter,
		colorScheme: colorScheme
	};
	methods.forEach(method => method(control));
	handleControl(control);
}

function init(){
	// set height and width of the svg element
	width = window.innerWidth - 2*offset;
	height = window.innerHeight - 2*offset;

	// draw canvas based on size
	w = Math.floor(resolution*aspectRatio);
	h = Math.floor(resolution);

	canvas = d3.select('canvas')
	.attr('width', w*pixel)
	.attr('height', h*pixel)
	.on('click', handleClickZoom);

	context = canvas.node().getContext('2d');

	data = [];
	d3.range(w*h).forEach(function(i){
		data.push({
			x: i%w,
			y: Math.floor(i/w)
		});
	});

	// set up initial scales, colors and iterations
	changeControls(controlButtons.reset);

	window.onkeydown = e => changeControls(controlKeys[e.key]);
}

init();
