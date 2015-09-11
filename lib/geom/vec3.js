
define([], function() {

    function Vec3(x, y, z)
    {
        if(arguments.length === 0) {

            return { x: 0, y: 0, z: 0 };

        }

        if(typeof(x) == 'number') {

            if(y === undefined)
                y = x;

            if(z === undefined)
                z = y;

            return {
                x: x, y: y, z: z
            };
        }

        if({}.hasOwnProperty.call(x, 'z')) {

            return { x: x.x, y: x.y, z: x.z };

        } else if({}.hasOwnProperty.call(x, 'x')) {

            return { x: x.x, y: x.y, z: 0 };

        }

        return { x: 0, y: 0, z: 0 };
    }

    Vec3.add = function add(a, b) {

        return typeof(b) === 'number' ?
                 Vec3(a.x + b, a.y + b, a.z + b) :
                 Vec3(a.x + b.x, a.y + b.y, a.z + b.z);

    }

    Vec3.subtract = function subtract(a, b) {

        return typeof(b) === 'number' ?
                 Vec3(a.x - b, a.y - b, a.z - b) :
                 Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    Vec3.multiply = function multiply(a, b) {

        return typeof(b) === 'number' ?
                 Vec3(a.x * b, a.y * b, a.z * b) :
                 Vec3(a.x * b.x, a.y * b.y, a.z * b.z);
    }

    Vec3.divide = function divide(a, b) {

        return typeof(b) === 'number' ?
                 Vec3(a.x / b, a.y / b, a.z / b) :
                 Vec3(a.x / b.x, a.y / b.y, a.z / b.z);
    }


    Vec3.min = function min(a, b) {
        
        return Vec3(Math.min(a.x, b.x),
                    Math.min(a.y, b.y),
                    Math.min(a.z, b.z));

    }

    Vec3.max = function max(a, b) {
        
        return Vec3(Math.max(a.x, b.x),
                    Math.max(a.y, b.y),
                    Math.max(a.z, b.z));

    }

    Vec3.abs = function abs(vector) {
        
        return Vec3(Math.abs(vector.x),
                    Math.abs(vector.y),
                    Math.abs(vector.z));

    }

    Vec3.difference = function difference(a, b) {

        return Vec3.abs(Vec3.subtract(a, b));

    }

    Vec3.toPathString = function toPathString(v) {

        return v.x + ',' + v.y + ',' + v.z;

    };

    Vec3.equals = function equals(a, b) {

        return a.x === b.x && a.y === b.y && a.z === b.z;

    }

    return Vec3;
});






