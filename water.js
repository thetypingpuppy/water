var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var buttonReset = document.getElementById('buttonReset');
var inputD = document.getElementById('inputD');
var inputV = document.getElementById('inputV');

var x = 0, width = 480, height = 270;

var DECAY = 0.995;
var V = 0.06;

var SIZE = 50;

var xarray = new Array();
var yarray = new Array();

var flowArray = new Array();

var volArray = new Array();
var g = 0.05

var ball = {velocity:[0,0], position:[200,300], radius: 20};

var getFlow = function(i) {
	switch (i) {
	case 0:
	case SIZE - 1:
		return 0;
	default:
		return flowArray[i - 1];
	}
}

var getHeight = function(i) {
	if (i == 0) {
		return (volArray[0].vol + (volArray[0].vol - volArray[1].vol));
	}
	if (i == SIZE - 1) {
		return (volArray[SIZE - 2].vol + (volArray[SIZE - 2].vol - volArray[SIZE - 3].vol));
	}
	return ((volArray[i - 1].vol + volArray[i].vol) / 2);
}

var click = function(e) {
	var x = e.clientX - canvas.offsetLeft;
	for (var i = 0; i < SIZE - 1; i++) {
		var d = xarray[i] - x;
		d = d > 0 ? d : -d;
		d = 50 - d;
		d = d > 0 ? d : 0;
		volArray[i].vol += d;
	}
}

var update = function() {
	for (var i = 0; i < SIZE; i++) {
		yarray[i] = getHeight(i);
	}
	for (var i = 0; i < SIZE - 2; i++) {
		flowArray[i] += (volArray[i].vol - volArray[i + 1].vol) * V;
		flowArray[i] *= DECAY;

	}
	for (var i = 0; i < SIZE - 1; i++) {

		var vol = volArray[i];

		var change = getFlow(i) - getFlow(i + 1);
		if (change < -3 && !vol.hasBlob) {
			vol.heightOfTheBlob = 2
			vol.speedOfTheBlob = 1;
			vol.blobElevation = vol.vol;
			vol.hasBlob = true;
			//vol.vol -= vol.heightOfTheBlob;
		}
		if (vol.hasBlob) {
			vol.speedOfTheBlob -= g;
			vol.blobElevation += vol.speedOfTheBlob;
			if (vol.blobElevation <= vol.vol) {
				vol.hasBlob = false;
				//vol.vol += vol.heightOfTheBlob;
			}
		}
		vol.vol += change;
		if (vol.vol < 0) {
			vol.vol = 0;
		}
		//want to stop stuff flowing out of as well
		// what the fuck does this mean
	}

	ball.velocity[1] += g;

	//ball.velocity[0] *= 0.9;
	ball.velocity[1] *= 0.93;

	ball.position[0] += ball.velocity[0];
	ball.position[1] -= ball.velocity[1];

	var h = getHeightAtPoint(ball.position[0]);

	if (ball.position[0] + ball.radius > width && ball.velocity[0] > 0) {
		ball.velocity[0] *= -0.9;
	}

	if (ball.position[0] - ball.radius < 0 && ball.velocity[0] < 0) {
		ball.velocity[0] *= -0.9;
	}

	if (ball.position[1] < h.height){

		ball.position[1] = h.height;
		ball.velocity[0] += h.heightGradient/199;
		ball.velocity[1] += 0.1*change;
	}


}

function getHeightAtPoint(x) {
	for (var i = 0; i < xarray.length; i++) {
		if (xarray[i] > x) {
			if (i == 48) { i = 47; }
			return {
				height: volArray[i].vol,
				heightGradient: volArray[i].vol - volArray[i + 1].vol
			};
		}
	}
}

var draw = function() {
	ctx.fillStyle = 'rgba(0,0,0,0.3)';
	ctx.beginPath();
	ctx.rect(0, 0, width, height);
	ctx.closePath(); 
	ctx.fill();
	
	ctx.fillStyle = '#0020ff';
	ctx.beginPath();
	ctx.moveTo(0, height);
	for (var i = 0;i<SIZE;i++) {
		ctx.lineTo(xarray[i], height - yarray[i]);
	}

	ctx.lineTo(width, height);
	ctx.closePath(); 
	ctx.fill();



	xarray.forEach(function(x, i) {
		var vol = volArray[i];

		if (i < 49 && vol.hasBlob) {
			ctx.fillStyle = '#0000ff';
			ctx.beginPath();
			ctx.rect(x, height - vol.blobElevation, 10, vol.heightOfTheBlob);
			ctx.closePath();
			ctx.fill();
		}

		/*ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
		ctx.beginPath();
		ctx.rect(x, height/2, 5, flowArray[i] * 20);
		ctx.closePath();
		ctx.fill();*/


	});

ctx.beginPath();
ctx.arc(ball.position[0], height - ball.position[1] - ball.radius, ball.radius, 0, 2*Math.PI);
ctx.fillStyle = '#ffffff'
ctx.fill();

}

var Loop = function(){
	update();
	draw();
	requestAnimationFrame(Loop);
}

var reset = function(){
	for (var i = 0; i < SIZE; i++) {
		xarray[i] = i * width / (SIZE - 1);
		if (i < SIZE - 1) {
			volArray[i] = {vol: height / 2};
		}
		if (i < SIZE - 2) {
			flowArray[i] = 0;
		}
	}
}

var setD = function() {
	DECAY = inputD.value;
}

var setV = function() {
	V = inputV.value;
}

reset();

ctx.fillStyle = '#000000';
ctx.beginPath();
ctx.rect(0, 0, width, height);
ctx.closePath(); 
ctx.fill();

canvas.onclick = click;
buttonReset.onclick = reset;
inputV.oninput = setV;
inputD.oninput = setD;

Loop();