'use strict'

mocha.setup('bdd')
mocha.checkLeaks()

require('../buffer_test')
require('../transcode_test')

mocha.run()
