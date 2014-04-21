var path = require('path'),
    Promise = require('bluebird');

describe('Source vs Compiled', function () {
  it('should produce exactly the same output', function () {
    return Promise.all([load(SRC), load(LIB)])
    .spread(function (lib, src) {
      lib.should.eql(src);
    });
  });
});


function load (lib) {
  return lib.compiler.reader.load(path.join(__dirname, '..', 'src'))
  .then(function (sources) {
    return lib.compiler.generateSources(sources, {});
  });
}