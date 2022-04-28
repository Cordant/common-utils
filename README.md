# Common Utils

This package should be imported as follows:

```javascript
const {createLambda} = require('common-utils');
const {Database, Responses, Payload} = require('common-utils/api');
const {Database} = require('common-utils/database');
const {Logger} = require('common-utils/logger');
const {SSM} = require('common-utils/ssm');
const {Validate} = require('common-utils/validate');
```

# Best Practices

## Always use `createLambda`

When starting a new lambda function always wrap the lambda with `createLambda`, this checks that the call is not a
Warm-up one.
See example below:

```javascript
module.exports.handler = createLambda(async (event) => {
  //... Lambda Code ...
});
```

## try/catch block

Always wrap your function with a try/catch block to handle the error. This is only needed if not using the `Database`
from `common-utils/api` directly, as error are handled appropriately internally.

```javascript
const {createLambda} = require('common-utils');
const {Responses} = require('common-utils/api');

module.exports.handler = createLambda(async (event) => {
  try {
    /* ... Do actions ... */
    return Responses.success('Retrieved example data successfully.')
  } catch (err) {
    return Responses.internalError('Failed to retrieve example data.', err)
  }
});
```

## Try to use only one `Database` class

Import only one `Database` class per function either from `common-utils/database` or `common-utils/api`.

If you need to call the database and return an API response directly without having to modify the data
use `common-utils/api`. See below:

```javascript
const {createLambda} = require('common-utils');
const {Database} = require('common-utils/api');

module.exports.handler = createLambda(async (event) => {
  return await Database.process(
    event,
    'tst_example_function',
    ['id', 'name'],
    'Retrieved example data successfully.',
    'Failed to retrieve example data.'
  );
});
```

In case, you need to access the data return from `Database` to manipulate it, use `common-utils/database` instead.
You will still need to return an API response at the end, so you need to use the `Responses` from `common-utils/api`.
In this instance, you also need to handle all the error messages yourself, therefore always wrap the function in a
try/catch.

See below:

```javascript
const {createLambda} = require('common-utils');
const {Database} = require('common-utils/database');
const {Responses} = require('common-utils/api');

module.exports.handler = createLambda(async (event) => {
  try {
    const data = await Database.process(
      event,
      'tst_example_function',
      ['id', 'name'],
    );

    // ... Modify `data` variable and use value.

    return Responses.success('Retrieved example data successfully.')
  } catch (err) {
    return Responses.internalError('Failed to retrieve example data.', err)
  }
});
```

Note that if needed, you are still able to use javascript import class alias to use both `Database` classes but this
is **not** recommended, example below:

```javascript
// NOT RECOMMENDED
// Javascript
const {Database} = require('common-utils/database');
const {Database: APIDatabase} = require('common-utils/api');

// Typescript
const {Database} = require('common-utils/database');
const {Database as APIDatabase} = require('common-utils/api');
```

## Use `Logger` class

There are many methods available within then `Logger` class, some useful ones below.

```javascript
const {Logger} = require('common-utils/logger');

Logger.log('Information that needs to always be logged');
Logger.verbose('Information that should only be visible, if you need to debug!');
Logger.debug('Information that is useful for debugging purpose!');
Logger.sensitive('Sensitive Bank Details', '012172981720');
Logger.error('User-friendly Message', {data: 'value'});
Logger.awsError({awsErrorObject: 'ErrorsFromAWS'});
```

Since `Logger.verbose` is only shown if DEBUG environment variable is 'true', it is useful to use it as much as
possible.
This can be useful to debug and can help explain the code.

Use `Logger.awsError` in the `Promise.catch` from the AWS service calls, in this instance you can either handle there or
rethrow it to be catch another try/catch block.

```javascript
s3Client.send(command).catch(err => {
  Logger.awsError(err);
  throw err;
});
```

A well logged function should look something like this.

```javascript
const {createLambda} = require('common-utils');
const {Database} = require('common-utils/database');
const {Responses} = require('common-utils/api');
const {S3Client, GetObjectCommand} = require('@aws-sdk/client-s3')
const s3Client = new S3Client({});

function actionOnObject(s3Object) {
  Logger.verbose('actionOnObject');
  /* Do something! */
}

module.exports.handler = createLambda(async (event) => {
  Logger.verbose('Lambda Start');
  try {
    Logger.verbose('Calling database');
    const data = await Database.process(
      event,
      'tst_example_function',
      ['id', 'name'],
    );
    Logger.debug('Data received from database', data);

    Logger.verbose('Calling S3 to get file');
    const s3Object = s3Client.send(new GetObjectCommand({...})).catch(err => {
      Logger.awsError(err);
      throw err;// Rethrow to the error to be handled by the try/catch block instead.
    });
    Logger.sensitive('S3 Identity Password', s3Object.exampleSensitiveData);
    Logger.verbose('Retrieved S3 object successfully');

    Logger.verbose('Action on S3 object');
    actionOnObject(s3Object);
    Logger.verbose('S3 Object acted on');

    Logger.verbose('Returning success response');
    return Responses.success('Retrieved example data successfully.')
  } catch (err) {
    Logger.verbose('Returning error response');
    return Responses.internalError('Failed to retrieve example data.', err);
  }
});
```

## Use `Validate` class

When you need to ensure that the data receive is always required use this class.
It will throw an error if the data passed is missing.

```javascript
const {Validate} = require('common-utils/validate');

module.exports.handler = createLambda(async (event) => {
  try {
    const data = getData();
    // Check that id and email was received
    Validate.number(data.id, 'data.id');
    Validate.string(data.email, 'data.email');

    // Will only get to this case if the id and email was passed.
    operateOnData(data);
   
    return Responses.success('Example completed successfully.')
  } catch (err) {
    return Responses.internalError('Example Failed.', err)
  }
});
```
