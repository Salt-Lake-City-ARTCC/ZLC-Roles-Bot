module.exports = function() {
    
    //convert arguments object to array
    var args = Array.prototype.slice.call(arguments);


    //throw error if arguments contain non-finite number values
    if (!args.every(Number.isFinite)) {
        throw new TypeError('sum() expects only numbers.')
    }

    //returns sum of arguments
    return args.reduce(function(a,b) {
        return a + b;
    }, 0);
}