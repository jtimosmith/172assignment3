/*
CMPE 172 Assignment 3
Transform Stream
Jason Smith
*/

//all listed variables
var fs = require('fs');
var commander = require('commander');
var transform = require('stream').Transform;
var utility = require( "util" ).inherits;
var results = [];

//used to transform the input data
function match(PM){
	this.PM = PM;
	transform.call(this, {objectMode: true});
}

utility(match, transform);

//rearranges input data depending on received input
match.prototype._transform = function(chunk, encoding, getNext){
	var data = chunk.toString();
    if (this._lastLineData){
    	data = this._lastLineData + data;
    }
    var sect = data.split(this.PM);
    this._lastLineData = sect.splice(sect.length -1,1)[0];
    sect.forEach(this.push.bind(this));
    getNext();
}

//outputs values to stream
match.prototype._flush = function(complete){ 
	if (this._lastLineData){
		this.push(this._lastLineData);
	} 
    this._lastLineData = null;   
    complete();
}

//receives particular type of parsing
commander
    .option('-p, --pattern <pattern>', 'Input pattern such as: "." " /n ","')
    .parse(process.argv);

//opens input stream
var inStream = fs.createReadStream( "input-sensor.txt" );

//finds "." or "," in input files
var pattStream = inStream.pipe(new match(commander.pattern));

//returns the errors
pattStream.on('readable', function(){
	var goodMatch;
	while ((goodMatch = pattStream.read()) !== null){
		results.push(goodMatch);
	}
});

//displays the input and resulting text via the console
console.log("--- Input ---");
inStream.pipe(process.stdout);
pattStream.on('end', function(){
	console.log("--- Output ---");
	console.log(results);
});
