const offset = 10;
const pixel = 1;
const resolution = 480;
const aspectRatio = 16/9;
const colorScale = d3.scaleSequential().domain([1, 0]).interpolator(d3.interpolateInferno);
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
	data.forEach(function(d){
		context.fillStyle = getPixelColor(d);
		context.fillRect(pixel*d.x, pixel*d.y, pixel, pixel);
	});
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

	// set up initial scales, and iterations
	cx = cy = 0;
	scope = 1.5;
	iter = 25;
	setPanFraction(3);
	handlePanAndZoom(0,0);

	window.onkeydown = handleKeyPress;
}

init();
