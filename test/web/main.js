'use strict'

mocha.setup('bdd')
mocha.checkLeaks()

require('../buffer_test')

mocha.run()
