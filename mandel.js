const iterations = 1000;

function mandel(x0,y0, it = iterations){
	var x = 0;
	var y = 0;
	var i = 0;
	while(x*x+y*y<4 && i<it){
		i++;
		[x,y] = [x*x - y*y + x0, 2*x*y + y0];
	}
	return i/it;
}