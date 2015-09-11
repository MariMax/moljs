
define(['./svg',
        './molparser',
        './atom',
        './bond',
        './geom/rect',
        './geom/vec2',
        './geom/vec3',
        './geom/matrix' ],
        
function(SVG, Parser, Atom, Bond, Rect, Vec2, Vec3, Matrix) {

    function Molecule(opts) {

        this.element = opts.element;

        this.surface = SVG(opts.element);

        this.geom = {

            doubleBondSpacing: 5,
            carbonDotSize: 5,
            bondOffset: 15

        };

        this.opts = {

            showCarbon:
                opts.showCarbon !== undefined ?
                    opts.showCarbon: false


        }

        this.size = Vec2(500, 500);

        this.atoms = [];
        this.bonds = [];
    }

    Molecule.prototype = {

        setMolfile: function setMolfile(molfile) {

            var opts = this.opts;

            var molecule = Parser.parseMolfile(molfile);

            var minCoord = Vec3(Number.MAX_VALUE),
                maxCoord = Vec3(Number.MIN_VALUE);

            molecule.atoms.forEach(function(atom) {

                minCoord = Vec3.min(minCoord, atom.coord);
                maxCoord = Vec3.max(maxCoord, atom.coord);

            });

            var coordRange = Vec3.difference(minCoord, maxCoord);

            var displayList = {};

            displayList.atoms = molecule.atoms.map(function(atom) {

                var coord = Vec3.divide(Vec3.add(Vec3.multiply(minCoord, -1), atom.coord), coordRange);

                coord.y = 1.0 - coord.y;

                return {

                    symbol: atom.symbol,

                    coord: coord,

                    hydrogenCount: atom.hydrogenCount,
                    
                    valence: atom.valence,

                    bonds: atom.bonds,

                    charge: atom.charge

                }

            });


            displayList.bonds = molecule.bonds.map(function(bond) {

                return {

                    firstAtom: displayList.atoms[bond.firstAtom.index],
                    secondAtom: displayList.atoms[bond.secondAtom.index],
                    type: bond.type


                }
            });

            displayList.atoms.forEach(function(atom) {

                atom.bonds.forEach(function(bond, i) {

                    atom.bonds[i] = displayList.bonds[bond.index];

                });
            });

            console.log(displayList);


            this.displayList = displayList;


            this.redraw();
        },


        getDisplayList: function getDisplayList() {

            return this.displayList;

        },

        redraw: function redraw() {

            var boundingBox = Rect(Vec2(0, 0), this.size);

            var molecule = this;

            this.atoms.forEach(function(atom) {
                atom.remove();
            });

            this.bonds.forEach(function(bond) {
                bond.remove();
            });

            this.atoms = this.displayList.atoms.map(function(atomObject) {

                var atom = Atom.render(molecule, atomObject);

                atom.move(atomObject.coord.x * molecule.size.x,
                          atomObject.coord.y * molecule.size.y);

                return atom;
            });

            this.bonds = this.displayList.bonds.map(function(bondObject) {

                var bond = Bond.render(molecule, bondObject);

                return bond;
            });

            var group = this.surface.group();

            this.bonds.forEach(group.add.bind(group));
            this.atoms.forEach(group.add.bind(group));

            this.atoms.forEach(function(atom) {

                atom.front();
            });

            var bbox = Rect(group.bbox());

            var transform = Matrix();

            transform = Matrix.multiply(transform,
                Matrix.translation(Vec2(- bbox.topLeft.x + 16, - bbox.topLeft.y + 16)));

            group.transform({ matrix: Matrix.toSVGString(transform) });


            bbox = Rect(group.bbox());

            this.size = Vec2(Rect.width(bbox) + 32, Rect.height(bbox) + 32);

            this.element.style.width = this.size.x + 'px';
            this.element.style.height = this.size.y + 'px';
        },

        setSize: function setSize(size) {

            this.size = size;

        },

        getSize: function getSize() {

            return this.size;

        }

    };

    return Molecule;

});
