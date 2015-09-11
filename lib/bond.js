
define([ './svg',
         './geom/rect',
         './geom/vec2',
         './geom/matrix'
], 

function(SVG, Rect, Vec2, Matrix) {

    function renderBond(design, bond) {

        var group = design.surface.group();

        var firstCoord = Vec2.multiply(bond.firstAtom.coord, design.size),
            secondCoord = Vec2.multiply(bond.secondAtom.coord, design.size),
            delta = Vec2.subtract(secondCoord, firstCoord);

        var angle = Math.atan2(delta.y, delta.x);
        var traj = Vec2(Math.cos(angle), Math.sin(angle));

        var perpendAngle = angle - 1.57079633;
        var perpendTraj = Vec2(Math.cos(perpendAngle), Math.sin(perpendAngle));

        if(bond.firstAtom.svg) {
            firstCoord = Vec2.add(firstCoord, Vec2.multiply(traj, design.geom.bondOffset));
        }

        if(bond.secondAtom.svg) {
            secondCoord = Vec2.subtract(secondCoord, Vec2.multiply(traj, design.geom.bondOffset));
        }

        var spacing = design.geom.doubleBondSpacing * 0.5;

        if(bond.type === 'double') {

            ([ design.surface.path(

                'M' + Vec2.toPathString(Vec2.subtract(
                            firstCoord, Vec2.multiply(perpendTraj, spacing))) +

                'L' + Vec2.toPathString(Vec2.subtract(
                            secondCoord, Vec2.multiply(perpendTraj, spacing))) +

                'Z'),

             design.surface.path(

                'M' + Vec2.toPathString(Vec2.add(
                            firstCoord, Vec2.multiply(perpendTraj, spacing))) +

                'L' + Vec2.toPathString(Vec2.add(
                            secondCoord, Vec2.multiply(perpendTraj, spacing))) +

                'Z') ])

            .forEach(function(path) {

                path.attr('stroke', 'black');
                path.attr('stroke-width', '3px');

                group.add(path);
            });

        } else if(bond.type === 'triple') {


            ([ design.surface.path(

                'M' + Vec2.toPathString(Vec2.subtract(
                            firstCoord, Vec2.multiply(perpendTraj, spacing))) +

                'L' + Vec2.toPathString(Vec2.subtract(
                            secondCoord, Vec2.multiply(perpendTraj, spacing))) +

                'Z'),

             design.surface.path(

                'M' + Vec2.toPathString(Vec2.add(
                            firstCoord, Vec2.multiply(perpendTraj, spacing))) +

                'L' + Vec2.toPathString(Vec2.add(
                            secondCoord, Vec2.multiply(perpendTraj, spacing))) +

                'Z'),
            
             design.surface.path(

                'M' + Vec2.toPathString(firstCoord) +
                'L' + Vec2.toPathString(secondCoord) +
                'Z')
            ])

            .forEach(function(path) {

                path.attr('stroke', 'black');
                path.attr('stroke-width', '1px');

                group.add(path);
            });

        } else {

            var path = design.surface.path(
                'M' + Vec2.toPathString(firstCoord) +
                'L' + Vec2.toPathString(secondCoord) +
                'Z' );

            path.attr('stroke', 'black');
            path.attr('stroke-width', '3px');

            group.add(path);

        }

        group.displayList = bond;
        bond.svg = group;

        return group;
    }

    return {

        render: renderBond

    };
});


