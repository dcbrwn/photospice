const req = require.context('./', false, /^.*\.yml$/);
const effects = req.keys()
  .map(req)
  .sort((a, b) => a.name.localeCompare(b.name));

export default effects;
