/***
 * Adds the following functions to Array objects: 
 * - contains()
 * - unique()
 * - pushUnique()
 * - mergeUnique()
 * - pushUniqueByID()
 * - sortBy()
 * - toCSV()
 ***/

/***
 * Checks if array contains an element
 * - Note: objects are compared by reference
 * @param (any data type)
 * @return (bool)
 * Usage examples:
 *   alert([1, 2, 3].contains(2)); // => true
 *   alert([1, 2, 3].contains('rubbish')); // => false
 *   alert([1, 2, 3].contains('2')); // => false
 *
 ***/
Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

/***
 * Removes duplicates from an array.
 * @return (Array) unique items
 * Usage examples:
 *   var duplicates = [1,3,4,2,1,2,3,8];
 *   var uniques = duplicates.unique(); // result = [1,3,4,2,8]
 ***/
Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr; 
};

/***
 * Pushes an element into an array only if it's unique
 * - Note: objects are compared by reference
 * @param (any data type)
 * @return (bool) whether anything has been added/updated
 ***/
Array.prototype.pushUnique = function(el) {
	if (el == null) return false;
	
	if(!this.contains(el)) {
		this.push(el);
		return true;
	}
	
    return false;
};


/***
 * Merges an array into another array
 * - Note: objects are compared by reference
 * @param (Array)
 * @return (bool) whether anything has been added/updated
 ***/
Array.prototype.mergeUnique = function(arr) {
	if (arr == null) return false;
	var added = false;
	for(var i = 0; i < arr.length ; i++) {
		if(!this.contains(arr[i])) {
			this.push(arr[i]);
			added = true;
		}
	}
    return added;
};

/****
 * Adds pushUniqueByID() to Arrays
 * - requires each object have field 'id'
 * - adds object only if its 'id' is not found
 * - if found, object is updated
 * @return (bool) whether any object has been added/updated
 ****/
Array.prototype.pushUniqueByID = function (obj){
	if (obj == null) return false;
	if (obj.id == null) return false;
	for (var i=0; i < this.length; i++) {
		if (this[i].id == obj.id) {
			this[i] = obj;
			return true;
		}
	}
	
    this.push(obj);
    return true;
}; //pushUniqueByID()

/****
 * Merges an input Array of objects into this Array
 * - requires each object have field 'id'
 * - adds object only if its 'id' is not found
 * - if found, object is updated
 * @return (bool) whether any object has been added/updated
 ****/
Array.prototype.mergeUniqueByID = function (objs){
	if (objs == null) return false;
	var changed = false;
	for (var i=0; i<objs.length; i++) {
		if (this.pushUniqueByID(objs[i])) changed = true;
	}
	return changed;
}; //mergeUniqueByID()

/****
 * Gets an object by its ID
 * - requires array to contain objects with field 'id'
 * @return object or null if not found
 ****/
Array.prototype.getByID = function(id){
	for (var i=0; i<this.length; i++) {
		if (this[i].id == id) return this[i];
	}
	return null;
}; //getByID()

/****
 * Gets objects from an array by a key, value pair
 * - requires array to contain objects with field requested
 * @return (Array) objects found, empty array if no matches
 ****/
Array.prototype.getByKeyValue = function(key, value){
	return this.filter(function (el) {
		return el[key] == value;
	});
};

/****
 * Remove an object from the array
 * - requires array to contain objects with field 'id'
 * @return (bool) success
 ****/
Array.prototype.removeByID = function(id) {
	for (var i=0; i<this.length; i++) {
		if (this[i].id == id) {
			this.splice(i, 1);
			return true;
		}
	}
	
	return false;
}; //removeByID()

/****
 * Remove an element from the array
 * @return (bool) success
 ****/
Array.prototype.remove = function(el) {
	for (var i=0; i<this.length; i++) {
		if (this[i] == el) {
			this.splice(i, 1);
			return true;
		}
	}
	
	return false;
};

/***
 * Moves an item from an index to another
 * - Note: Array is modified in-place.
 * - Note: negative indices are calculated from back of array
 * - Note: ignores out of index
 * @param {type} old_index
 * @param {type} new_index
 * @returns {Array.prototype} 
 */
Array.prototype.move = function (old_index, new_index) {
	// Ignore if out of index
	if (Math.abs(old_index) >= this.length || Math.abs(new_index) >= this.length) {
		return this;
	}
	
    while (old_index < 0) {
        old_index += this.length;
    }
    while (new_index < 0) {
        new_index += this.length;
    }
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
	return this;
};

/***
 * Used to create reusable sort functions to sort an array of objects by any field.
 * @param (string) field name
 * @param (bool) ASC order
 * @param (function) any primer function to use, e.g. parseInt
 * @return (Array) sorted objects
 * Usage example:
 *		products.sortBy('price', true, parseInt);
 ***/
Array.prototype.sortBy = function(field, asc_order, primer){
	function arraySortBy(field, asc_order, primer) {
		var key = primer ? 
			function(x) {return primer(x[field])} : 
			function(x) {return x[field]};
	
		asc_order = [-1, 1][+!!asc_order];
		
		return function (a, b) {
			return a = key(a), b = key(b), asc_order * ((a > b) - (b > a));
		}
	} //arraySortBy()
	
	return this.sort(arraySortBy(field, asc_order, primer));
};

/***
 * Converts an array to a CSV string
 * - Note: elements that are objects will be toString()
 * - Note: elements that are numbers will be parseFloat()
 ***/
Array.prototype.toCSV = function() {
	var tmpStr = '';
	var tmpArr = [];
	for (var i=0; i<this.length; i++) {
		if (typeof this[i] === 'boolean') {
			tmpArr.push(this[i]);
		}
		else if (typeof this[i] === 'number') {
			tmpArr.push(parseFloat(this[i]));
		}
		else if (typeof this[i] === 'string') {
			tmpStr = this[i].replace(/"/g, '""'); //escape double quotes
			tmpArr.push('"' + tmpStr + '"');
		}
		else if (typeof this[i] === 'object') {
			tmpStr = this[i].toString().replace(/"/g, '""'); //escape double quotes
			tmpArr.push('"' + tmpStr + '"');
		}
	}
	return tmpArr.join(',');
};
