
define([], function() {

return {
    
    parseMolfile: function parseMolfile(molfile) { 

        function removeCR(line) {

            return line.split('\r').join('');
        }

        var lines = molfile.split('\n').map(removeCR);

        var molecule = {};

        parseHeader(molecule, lines);
        parseCTab(molecule, lines);

        console.log(molecule);

        return molecule;
    }
};

function parseHeader(molecule, lines) {

    var name = lines.shift().trim();

    if(name.length > 0)
        molecule.name = name;

    var meta = parseLine
        (lines.shift(), 'IIPPPPPPPPMMDDYYHHmmddSSssssssssssEEEEEEEEEEEERRRRRR',
    {
        'I': { key: 'userInitials',           fn: String },
        'P': { key: 'programName',            fn: String },
        'M': { key: 'month',                  fn: parseInt,   def: 1 },
        'D': { key: 'day',                    fn: parseInt,   def: 0 },
        'Y': { key: 'year',                   fn: parseInt,   def: 0},
        'H': { key: 'hour',                   fn: parseInt,   def: 0},
        'm': { key: 'minute',                 fn: parseInt,   def: 0},
        'd': { key: 'dimension',              fn: String },
        'S': { key: 'scalingFactorsMajor',    fn: String },
        's': { key: 'scalingFactorsMinor',    fn: String },
        'E': { key: 'energy',                 fn: String },
        'R': { key: 'internalRegistryNumber', fn: String }
    });

    if (meta.year !== undefined) {

        molecule.date = new Date(
            meta.year < 80 ? 2000 + meta.year : 1900 + meta.year,
            meta.month, meta.day, meta.minute
        );
    }

    if(meta.dimension !== undefined)
        molecule.dimension = meta.dimension;

    var comment = lines.shift().trim();

    if(comment.length > 0)
        molecule.comment = comment;
}

function parseCTab(molecule, lines) {

    var counts = parseLine
        (lines.shift(), 'aaabbblllfffcccsssxxxrrrpppiiimmmvvvvvv',
    {
        'a': { key: 'numAtoms',                 fn: parseInt,   def: 0 },
        'b': { key: 'numBonds',                 fn: parseInt,   def: 0 },
        'l': { key: 'numAtomLists',             fn: parseInt,   def: 0 },
        'c': { key: 'chiralFlag',               fn: parseFlag,  def: false },
        's': { key: 'numStextEntries',          fn: parseInt,   def: 0 },
        'm': { key: 'numAdditionalProperties',  fn: parseInt,   def: 999 },
        'v': { key: 'version',                  fn: String,     def: 0 }
    });

    molecule.version = counts.version;
    molecule.chiral = counts.chiral;
    molecule.atoms = Array(counts.numAtoms);
    molecule.bonds = Array(counts.numBonds);
    molecule.atomLists = Array(counts.numAtomLists);
    molecule.stextEntries = Array(counts.numStextEntries);

    parseAtoms(molecule, lines);
    parseBonds(molecule, lines);
    //parseAtomLists(molecule, lines);
    //parseStextBlock(molecule, lines);
    parseProperties(molecule, lines);
}

function parseAtoms(molecule, lines) {

    for(var i = 0; i < molecule.atoms.length; ++ i) {

        var line = lines.shift();

        if(line === undefined)
            continue;

        var atom = parseLine
            (line, 'xxxxxxxxxxyyyyyyyyyyzzzzzzzzzz aaaddcccssshhhbbbvvvHHHrrriiimmmnnneee',
        {
            'x': { key: 'x',                        fn: parseFloat,     def: 0 },
            'y': { key: 'y',                        fn: parseFloat,     def: 0 },
            'z': { key: 'z',                        fn: parseFloat,     def: 0 },
            'a': { key: 'symbol',                   fn: String,         def: '' },
            'd': { key: 'massDifference',           fn: parseInt,       def: 0 },
            'c': { key: 'charge',                   fn: parseInt },
            's': { key: 'stereoParity',             fn: parseInt },
            'h': { key: 'hydrogenCountPlusOne',     fn: parseInt,       def: 0 },
            'b': { key: 'stereoCareBox',            fn: parseInt,       def: 0 },
            'v': { key: 'valence',                  fn: parseInt,       def: 0 },
            'H': { key: 'H0Designator',             fn: parseInt,       def: 0 },
            'm': { key: 'atomAtomMappingNumber',    fn: parseInt,       def: 0 },
            'n': { key: 'inversionRetentionFlag',   fn: parseInt,       def: 0 },
            'e': { key: 'exactChangeFlag',          fn: parseFlag,      def: false }
        });

        molecule.atoms[i] = {

            index: i,

            coord: { 
                x: atom.x,
                y: atom.y,
                z: atom.z
            },

            symbol: atom.symbol,

            massDifference: atom.massDifference,

            charge: ({

                0: 0,
                1: 3,
                2: 2,
                3: 1,
                4: 'doublet-radical',
                5: -1,
                6: -2,
                7: -3
                
            })[atom.charge],

            hydrogenCount: atom.hydrogenCountPlusOne - 1,

            valence: atom.valence,

            bonds: []
        };
    }
}

function parseBonds(molecule, lines) {

    for(var i = 0; i < molecule.bonds.length; ++ i) {

        var line = lines.shift();

        if(line === undefined)
            continue;

        var bond = parseLine
            (line, '111222tttsssxxxrrrccc',
        {
            '1': { key: 'firstAtom',                fn: parseInt,       def: NaN },
            '2': { key: 'secondAtom',               fn: parseInt,       def: NaN },
            't': { key: 'type',                     fn: parseInt,       def: 0 },
            's': { key: 'stereo',                   fn: parseInt,       def: 0 },
            'r': { key: 'topology',                 fn: parseInt,       def: 0 },
            'c': { key: 'reactingCenterStatus',     fn: parseInt,       def: 0 },
        });

        var firstAtom = molecule.atoms[bond.firstAtom - 1],
            secondAtom = molecule.atoms[bond.secondAtom - 1];

        var atomBond = {

            index: i,

            firstAtom: firstAtom,
            secondAtom: secondAtom,

            type: ({

                1: 'single',
                2: 'double',
                3: 'triple',
                4: 'aromatic',
                5: 'singleOrDouble',
                6: 'singleOrAromatic',
                7: 'doubleOrAromatic',
                8: 'any'

            })[bond.type],

            topology: ({

                0: 'either',
                1: 'ring',
                2: 'chain'

            })[bond.topology]


        };

        firstAtom.bonds.push(atomBond);
        secondAtom.bonds.push(atomBond);

        molecule.bonds[i] = atomBond;
    }
}

function parseProperties(molecule, lines) {

    var line;

    while(line !== 'M  END') {

        line = lines.shift();

    }


}

function parseLine(line, mask, format) {

    var tokens = {};

    for(var i = 0; i < mask.length && i < line.length; ++ i) {

        if(line[i] !== ' ') {

            var token = format[mask[i]];

            if(token === undefined)
                continue;

            if(tokens[token.key] === undefined)
                tokens[token.key] = '';

            tokens[token.key] += line[i];
        }
    }

    Object.keys(format).forEach(function(ch) {

        var token = format[ch];

        if(tokens[token.key] !== undefined) {

            tokens[token.key] = token.fn(tokens[token.key]);

        } else {

            if(token.def !== undefined)
                tokens[token.key] = token.def;

        }
    });

    return tokens;
}

function parseFlag(flag) {

    return flag == '1' ? true : false;

}

});
