// @flow
import { graphqlExpress } from 'graphql-server-express';
import depthLimit from 'graphql-depth-limit';
import costAnalysis from 'graphql-cost-analysis';
import Raven from 'shared/raven';
import UserError from '../../utils/UserError';
import createLoaders from '../../loaders/';

import createErrorFormatter from '../../utils/create-graphql-error-formatter';
import schema from '../../schema';

export default graphqlExpress(req => ({
  schema,
  formatError: createErrorFormatter(req),
  tracing: true,
  context: {
    user: req.user,
    loaders: createLoaders(),
  },
  validationRules: [
    depthLimit(10),
    costAnalysis({
      variables: req.body.variables,
      maximumCost: 750,
      defaultCost: 1,
      createError: (max, actual) => {
        const err = new UserError(
          `GraphQL query exceeds maximum complexity, please remove some nesting or fields and try again. (max: ${max}, actual: ${actual})`
        );
        return err;
      },
    }),
  ],
}));
