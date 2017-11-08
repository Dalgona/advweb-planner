# API Reference &mdash; Planner Resources

Base URL: `/api`

Boolean values in a query string: `"true"` is truthy. anything else is falsey.

## GET `/planner`

### Description

Gets a list of planners the current user owns.

This API **REQUIRES** a user token.

### Parameters

Content-Type: `(QUERY STRING)`

| name      | type    | description                              | required? |
|-----------|---------|------------------------------------------|-----------|
| stripUser | boolean | If set, `user` property will be omitted. | no        |

### Response

This API responds with a list of `planner` objects on success.

----------------------------------------------------------------------

## POST `/planner`

Creates a new planner belonging to the current user.

This API **REQUIRES** a user token.

### Parameters

Content-type: `application/x-www-form-urlencoded`

| name  | type   | description              | required? |
|-------|--------|--------------------------|-----------|
| title | string | Title of the new planner | yes       |

Content-Type: `(QUERY STRING)`

| name      | type    | description                              | required? |
|-----------|---------|------------------------------------------|-----------|
| stripUser | boolean | If set, `user` property will be omitted. | no        |

### Response

This API responds with a new `planner` object on success.

----------------------------------------------------------------------

## GET `/planner/:id`

Gets information about selected planner. The `id` parameter must be pointing at
a planner belonging to the current user.

This API **REQUIRES** a user token.

### Parameters

Content-Type: `(QUERY STRING)`

| name      | type    | description                              | required? |
|-----------|---------|------------------------------------------|-----------|
| stripUser | boolean | If set, `user` property will be omitted. | no        |

### Response

This API responds with a corresponding `planner` object on success.

----------------------------------------------------------------------

## PUT `/planner/:id`

Modifies information or settings of selected planner. The `id` parameter must be
pointing at a planner belonging to the current user.

This API **REQUIRES** a user token.

### Parameters

Content-type: `application/x-www-form-urlencoded`

| name  | type   | description              | required? |
|-------|--------|--------------------------|-----------|
| title | string | New title of the planner | yes       |

Content-Type: `(QUERY STRING)`

| name      | type    | description                              | required? |
|-----------|---------|------------------------------------------|-----------|
| stripUser | boolean | If set, `user` property will be omitted. | no        |

### Response

This API responds with a modified `planner` object on success.

----------------------------------------------------------------------

## DELETE `/planner/:id`

Permanently deletes selected planner and its contents. The `id` parameter must
be pointing at a planner belonging to the current user.

This API **REQUIRES** a user token.

### Parameters

Content-type: `application/x-www-form-urlencoded`

| name  | type   | description                               | required? |
|-------|--------|-------------------------------------------|-----------|
| title | string | New title of the planner for confirmation | yes       |

### Response

The response to this API call is not defined yet.
