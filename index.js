const offset = 20;
const pixel = 1;
const axisHeight = 20;
const axisWidth = 120;
const resolution = 480;
const operationPanelWidth = 420;
const aspectRatio = 16/9;
const globalColorScale = d3.scaleSequential().domain([1,0]).interpolator(d3.interpolateInferno);
const xScope = (s) => s*aspectRatio;
const yScope = (s) => s;

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
var svg;
var xAxis;
var yAxis;
var useGlobalColorSpace;
var recalculateColorSpace;
var fixColor;
var globe;
var home;

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

function recalculateColorScheme(){
	if(useGlobalColorSpace){
		colorScale = globalColorScale;
	}
	else if(recalculateColorSpace){
		colorScale = d3.scaleSequential()
		.domain([d3.max(data, d => d.v), d3.min(data, d => d.v)])
		.interpolator(d3.interpolateInferno);
	}
}

function calculate(){
	data.forEach(function(d){
		d.v = mandel(xScale(d.x), yScale(d.y));
	});
}

function render(){
	data.forEach(function(d){
		context.fillStyle = colorScale(d.v);
		context.fillRect(pixel*d.x, pixel*d.y, pixel, pixel);
	});
}

function draw(){
	// set view port to the coordinates and scale
	xScale = d3.scaleLinear()
	.domain([0,w])
	.range([cx-xScope(scope), cx+xScope(scope)]);

	yScale = d3.scaleLinear()
	.domain([0,h])
	.range([cy-yScope(scope), cy+yScope(scope)]);

	xAxis.call(d3.axisBottom(xAxisScale.domain(xScale.range())));
	yAxis.call(d3.axisRight(yAxisScale.domain(yScale.range())));

	// recalculate pixel info
	calculate();

	// recalculate color scheme if needed
	recalculateColorScheme();

	// render based on the color scheme
	render();

	// remove blurred bg image
	d3.select('div.bg-image').classed('bg-image', false);
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
		cx = xScale(w-x);
		cy = yScale(h-y);
		draw();
	}
}

function handleControl(control){
	cx = control.cx;
	cy = control.cy;
	scope = control.scope;
	iter = control.iter;
	draw();
}

function changeControls(methods){
	if(!methods) return;
	control = getControlObj();
	methods.forEach(method => method(control));
	// setTimeout(() => handleControl(control), 5);
	handleControl(control);
}

function getControlObj(){
	return {
		cx: cx,
		cy: cy,
		scope: scope,
		iter: iter
	};
}

function handleKeyPress(key){
	changeControls(controlKeys[key]);
}

function handleColorButtons(key){
	// fix color operation, change control and binded button
	if(key=='f')	recalculateColorSpace = !(fixColor.checked = recalculateColorSpace);

	// early return on just changing the fix color attribute
	if(key!='g'&&key!='l')	return;

	// set the color control attributes
	useGlobalColorSpace = key=='g';
	recalculateColorSpace = key=='l';

	// change binded dom elemets
	fixColor.disabled = useGlobalColorSpace;
	fixColor.checked = !recalculateColorSpace;
	globe.classList.remove('high','low');
	home.classList.remove('high','low');
	globe.classList.add(useGlobalColorSpace?'high':'low');
	home.classList.add(useGlobalColorSpace?'low':'high');
}

function init(){
	// set height and width of the svg element
	width = window.innerWidth - 2*offset;
	height = window.innerHeight - 2*offset;

	// draw canvas based on size
	w = Math.floor(resolution*aspectRatio);
	h = Math.floor(resolution);

	svg = d3.select('svg.axes')
	.style("top", offset)
	.style("left", offset)
	.attr('width', w+axisWidth)
	.attr('height',h+axisHeight);

	// axes space on svg
	xAxis = svg.append('g')
	.attr("transform", "translate(0," + h + ")");
	yAxis = svg.append('g')
	.attr("transform", "translate(" + w + ",0)");

	// define axes scale
	xAxisScale = d3.scaleLinear().range([0,w*pixel]);
	yAxisScale = d3.scaleLinear().range([0,h*pixel]);

	canvas = d3.select('canvas')
	.attr('width', w*pixel)
	.attr('height', h*pixel)
	.style("top", offset)
	.style("left", offset)
	.on('click', handleClickZoom);

	context = canvas.node().getContext('2d');

	var onside = width>w+axisWidth+operationPanelWidth;
	d3.select('.operations')
	.style('margin', 0)
	.style('top', offset + (onside?0:(h+axisHeight+offset)))
	.style('left', offset + (onside?(w+axisWidth):0));

	data = [];
	d3.range(w*h).forEach(function(i){
		data.push({
			x: i%w,
			y: Math.floor(i/w)
		});
	});

	// init color controls
	fixColor = document.getElementById('fix_color');
	globe = document.getElementById('globe');
	home = document.getElementById('home');

	// render with initial settings
	changeControls(controlButtons.reset);

	window.onkeydown = e => handleKeyPress(e.key);
}

init();
