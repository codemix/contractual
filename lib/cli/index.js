var yargs = require('yargs'), Promise = require('bluebird'), fs = Promise.promisifyAll(require('fs')), path = require('path'), npmPackage = require('../../package.json'), compiler = require('../compiler');
/**
 * Run the command line application.
 *
 * @param  {Array} argv  The command line arguments.
 */
exports.run = function (argv) {
    var declared = declareOptions(argv);
    argv = declared.argv;
    argv._.shift();
    if (argv.help || !argv._.length) {
        declared.showHelp();
    } else if (argv.version) {
        console.log(npmPackage.version);
    } else {
        return compiler.all(argv._, {
            dir: argv.output,
            global: argv.global,
            require: argv.require,
            libIdentifier: argv.libname,
            sourceMap: argv['source-map'],
            sourceMapRoot: argv['source-root']
        }).done();
    }
};
/**
 * Declare the command line options.
 */
function declareOptions(argv) {
    return yargs(argv).usage('\x1B[1m' + npmPackage.name + '\x1B[22m - ' + npmPackage.description + '\n\nUsage: contractual [OPTIONS] [FILES]').options({
        output: {
            alias: 'o',
            default: './out',
            description: 'The directory to write compiled files to.'
        },
        libname: {
            alias: 'l',
            description: 'The name of the identifier for the obligations library',
            default: 'OBLIGATIONS'
        },
        global: {
            alias: 'g',
            description: 'Whether a global identifier should be used for the obligations lib.',
            default: false
        },
        require: {
            alias: 'r',
            description: 'The obligations library to require, if `global` is not specified.',
            default: 'obligations'
        },
        'source-map': { description: 'If true generate source maps, if a string use it as the source filename for the map.' },
        'source-root': { description: 'If set, acts as the root for the source files listed in the source map.' },
        version: {
            alias: 'v',
            description: 'Show the version information.'
        },
        help: {
            alias: 'h',
            description: 'Show this help screen.'
        }
    });
}