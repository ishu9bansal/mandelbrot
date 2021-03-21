const dir = [-1, 0, 1, 0, -1]; // [left, down, right, up]

const controlMethods = {
	iter: function(step){
		return d => (d.iter+=step,d);
	},
	zoom: function(multiplier){
		return d => (d.scope*=multiplier,d);
	},
	pan: function(i, j, p){
		return function(d) {
			d.cx += i*p*d.scope;
			d.cy += j*p*d.scope;
			return d;
		}
	},
};

const controlButtons = {
	'd': [controlMethods.iter(25)],
	'z': [d =>  (d.scope=1.5,d)],
	'i': [controlMethods.zoom(0.5)],
	'o': [controlMethods.zoom(2)],
	'ArrowRight': [controlMethods.pan(dir[2], dir[3], 0.3)],
	'ArrowDown': [controlMethods.pan(dir[1], dir[2], 0.3)],
	'ArrowLeft': [controlMethods.pan(dir[0], dir[1], 0.3)],
	'ArrowUp': [controlMethods.pan(dir[3], dir[4], 0.3)],
	'reset': [d =>  (d.scope=1.5,d), d => (d.cx=0,d.cy=0,d.iter=25,d)]
};