

define([ './svg',
         './geom/rect',
         './geom/vec2',
         './geom/matrix',
         './valence'
], 

function(SVG, Rect, Vec2, Matrix, Valence) {

    function renderAtom(design, atom) {

        var group = design.surface.group();

        if(!design.opts.showCarbon &&
                atom.symbol === 'C' &&
                    atom.bonds.length > 1) {

            var dot = design.surface.circle();

            dot.radius(design.geom.carbonDotSize);
            dot.attr('stroke', 'black');
            dot.attr('stroke-width', '2px');
            dot.attr('fill', 'black');

            group.add(dot);

            return group;

        }

        var text = design.surface.text('');

        text.font({ anchor: 'middle', weight: 'bold' });

        text.build(true);

        var symbol = atom.symbol;

        /*console.log(atom.hydrogenCount);

        for(var i = 0; i < atom.hydrogenCount; ++ i)
            symbol = 'H' + symbol;*/

        var valence = atom.valence;

        if(valence === 0)
            valence = Valence.getValence(symbol);

        var implicitHydrogen;
       
        if(atom.hydrogenCount !== -1) {
            
            implicitHydrogen = atom.hydrogenCount;

        } else {
       
            implicitHydrogen = valence;

            if(atom.charge < 0)
                implicitHydrogen += atom.charge;

            atom.bonds.forEach(function(bond) {

                implicitHydrogen -= bond.type === 'double' ? 2 : 1;

            });
        }

        var avgBondDiff = Vec2();

        for(var i = 0; i < atom.bonds.length; ++ i) {

            var bond = atom.bonds[i];

            var otherAtom = bond.firstAtom === atom ?
                        bond.secondAtom : bond.firstAtom;

            var diff = Vec2.subtract(otherAtom.coord, atom.coord);

            avgBondDiff = Vec2.add(avgBondDiff, diff);

        }

        avgBondDiff = Vec2.divide(avgBondDiff, atom.bonds.length);

        if(avgBondDiff.x > 0) {

            for(var j = 0; j < implicitHydrogen; ++ j)
                symbol = 'H' + symbol;

        } else {

            for(var j = 0; j < implicitHydrogen; ++ j)
                symbol = symbol + 'H';
        }

        symbol = shortenSymbol(symbol)

        if(atom.charge < 0) {

            if(atom.charge < -1)
                symbol += superscript(- atom.charge);

            symbol = symbol + String.fromCharCode(0x207B);

        } else if(atom.charge > 0) {
            
            if(atom.charge > 1)
                symbol += superscript(atom.charge);

            symbol = symbol + String.fromCharCode(0x207A);
        }

        var label = text.tspan(symbol);

        text.build(false);

        group.add(text);

        text.front();

        text.move(0, -Rect.height(Rect(text.bbox())) * 0.5);

        group.displayList = atom;
        atom.svg = group;

        return group;
    }

    function shortenSymbol(symbol) {

        var shortened = '';

        var i = 0;

        while(i < symbol.length) {

            var element = symbol[i],
                count = 0;

            while(symbol[i] === element) {

                ++ count;
                ++ i;
            }

            shortened += element;
            
            if(count > 1)
                shortened += subscript(count);
        }

        return shortened;
    }

    function subscript(n) {

        return String.fromCharCode(0x2080 + n);
    }

    function superscript(n) {

        return String.fromCharCode(({

            1: 0x00B9, 2: 0x00B2, 3: 0x00B3

        })[n] || 0x2070 + n)
    }

    return {

        render: renderAtom

    };
});


