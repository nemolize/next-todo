const Enzyme = require('enzyme/build')
const Adapter = require('enzyme-adapter-react-16/build')

Enzyme.configure({ adapter: new Adapter() })
