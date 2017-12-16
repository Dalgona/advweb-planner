# API Reference &mdash; User Resources

Base URL: `/api`

## POST `/user`

### Description

Creates a new user account.

This API does not require a user token.

### Parameters

Content-type: `application/x-www-form-urlencoded`

| Name     | Type   | Description               | Required? |
|----------|--------|---------------------------|-----------|
| fullName | string | Full name of the user     | Yes       |
| email    | string | E-mail address            | Yes       |
| auth     | string | Password for the new user | Yes       |

### Response

This API responds with the new `user` object on success.

----------------------------------------------------------------------

## GET `/user`

### Description

Gets information about the current user identified by a token.

This API **REQUIRES** a user token.

### Parameters

None.

### Response

This API responds with a corresponding `user` object on success.

----------------------------------------------------------------------

## PUT `/user`

### Description

Updates information of the current user identified by a token.
Password will be changed only if both `oldAuth` and `newAuth` parameters are
provided and valid.

This API **REQUIRES** a user token.

### Parameters

Content-type: `application/x-www-form-urlencoded`

| Name     | Type   | Description               | Required? |
|----------|--------|---------------------------|-----------|
| fullName | string | The new full name         | No        |
| oldAuth  | string | The old password          | No        |
| newAuth  | string | The new password          | No        |

### Response

This API responds with an updated `user` object on success.

----------------------------------------------------------------------

## DELETE `/user`

### Description

Permanently deletes the current user account identified by a token, and any
contents created by the user. _This operation cannot be undone._

This API **REQUIRES** a user token.

### Parameters

Content-type: `application/x-www-form-urlencoded`

| Name     | Type   | Description                     | Required? |
|----------|--------|---------------------------------|-----------|
| email    | string | E-mail address for confirmation | Yes       |
| auth     | string | Password for confirmation       | Yes       |

**WARNING:** The application MUST NOT automatically send these arguments when
calling this API. Instead, it must have the user manually put his/her account
information before sending a request.

### Response

The response to this API call is not defined yet.

----------------------------------------------------------------------

## POST `/user/authenticate`

### Description

Matchs a user account with provided credential and generates a JSON web token
(JWT) for subsequent API calls. The client must save this token to a local
storage to keep the user signed in.

This API does not require a user token.

### Parameters

Content-type: `application/x-www-form-urlencoded`

| Name     | Type   | Description    | Required? |
|----------|--------|----------------|-----------|
| email    | string | E-mail address | Yes       |
| auth     | string | Password       | Yes       |

### Response

This API responds with a corresponding JWT data if the user can be verified.
