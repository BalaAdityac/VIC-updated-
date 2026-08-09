/**
 * Generic Zod validation middleware.
 * Pass a schema shaped like z.object({ body, query, params }) — only the
 * keys present in the schema are validated/parsed, and the parsed
 * (type-coerced, defaulted) values are written back onto req so
 * downstream handlers get clean data.
 */
function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  };
}

module.exports = validate;
