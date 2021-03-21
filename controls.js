const dir = [-1, 0, 1, 0, -1]; // [left, down, right, up]
const direction = {
	left: 0,
	down: 1,
	right: 2,
	up: 3
};
var pan = 0;
const controlMethods = {
	iter: function(step){
		return d => d.iter+=step;
	},
	zoom: function(multiplier){
		return d => d.scope*=multiplier;
	},
	pan: function(i, j){
		return function(d) {
			d.cx += i*pan*d.scope;
			d.cy += j*pan*d.scope;
		}
	}
};

const controlButtons = {
	iter25: [controlMethods.iter(25)],
	resetZoom: [d =>  d.scope=1.5],
	zoomIn: [controlMethods.zoom(0.5)],
	zoomOut: [controlMethods.zoom(2)],
	move: d => [controlMethods.pan(dir[direction[d]], dir[direction[d]+1])],
	reset: [d => (d.cx=0,d.cy=0,d.iter=25,d.scope=1.5,d.colorScheme='global'), d => pan = 0.5],
	panFraction: f => [d => pan = f]
};

var controlKeys = {
	'd': controlButtons.iter25,
	'D': controlButtons.iter25,
	'z': controlButtons.resetZoom,
	'Z': controlButtons.resetZoom,
	'i': controlButtons.zoomIn,
	'o': controlButtons.zoomOut,
	'I': controlButtons.zoomIn,
	'O': controlButtons.zoomOut,
	'l': [d => d.colorScheme = 'local'],
	'f': [d => d.colorScheme = 'fixed'],
	'g': [d => d.colorScheme = 'global']

};

for(var key in direction){
	var ck = 'Arrow' + key.charAt(0).toUpperCase() + key.slice(1);
	controlKeys[ck] = controlButtons.move(key);
}

for(var i=1; i<=9; i++){
	controlKeys[i.toString()] = controlButtons.panFraction(i/10);
}
