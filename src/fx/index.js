const req = require.context('./', false, /^.*\.yml$/);
const effects = req.keys().map(req);

export default effects;
