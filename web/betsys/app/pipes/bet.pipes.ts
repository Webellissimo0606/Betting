import { Pipe, PipeTransform } from '@angular/core';

/*
 * Takes a list(array of objects) and returns an object(with all the keys in the individual object of the list item grouped and listed as a single object) 
*/
@Pipe({name: 'listToObjectTransform'})
export class ListToObjectTransform implements PipeTransform {
  
  transform(value, args:any[]) : any {
    let listObj = {};

    for(var i=0; i < value.length; i++) {
    	var curObj = value[i];

    	for(var key in curObj) {
    		if(curObj.hasOwnProperty(key)) {
    			listObj[key] = curObj[key];
    		} 
    	}
    }
    return listObj;
  }
}

/*
 * Takes an object and returns an array
*/
@Pipe({name: 'objectToArrayTransform'})
export class ObjectToArrayTransform implements PipeTransform {
  
  transform(value, args:string[]) : any {
    let keys = [];
    
    for (let key in value) {
      keys.push({key: key, value: value[key]});
    }
    
    return keys;
  }
}


/*
 * Takes an array and shuffles its index positions
*/
@Pipe({name: 'arrayShuffle'})
export class ArrayShuffle implements PipeTransform {
  
  transform(value, args:any[]) : any {
    let shuffledAry = value;
    
    var currentIndex = shuffledAry.length, temporaryValue, randomIndex;

  	// While there remain elements to shuffle...
  	while (0 !== currentIndex) {

    	// Pick a remaining element...
    	randomIndex = Math.floor(Math.random() * currentIndex);
    	currentIndex -= 1;

    	// And swap it with the current element.
    	temporaryValue = shuffledAry[currentIndex];
    	shuffledAry[currentIndex] = shuffledAry[randomIndex];
    	shuffledAry[randomIndex] = temporaryValue;
  	}

  	return shuffledAry;
  }
}

/*
 * Takes an background color in hexadecimal format and returns its corresponding text color (#000 or #FFF) based on the 
 * background contrast
*/
@Pipe({name: 'returnTextColorRelativeToBackground'})
export class ReturnTextColorRelativeToBackground implements PipeTransform {
  
  transform(value, args:string) : any {
    
    var rgbObj = this.hexToRgb(value);
    var contrastValue = rgbObj.r * 0.2126 + rgbObj.g * 0.7152 + rgbObj.b * 0.0722;
    var textColor = "#FFFFFF";

    if (contrastValue > 179) {
      textColor = "#000000";
    }
  
    return textColor;
  }

  rgbToHex(r, g, b) {
    	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  hexToRgb(hex) {
    	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        	return r + r + g + g + b + b;
    	});

    	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    	
    	return result ? {
        	r: parseInt(result[1], 16),
        	g: parseInt(result[2], 16),
        	b: parseInt(result[3], 16)
    	} : null;
	}

}
