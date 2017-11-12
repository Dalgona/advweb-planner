# API Reference &mdash; To-do List Resources

Base URL: `/api`

## GET `/planner/:id/todo-list`

## Description

Gets a list of all to-do lists saved in selected planner.

## Parameters

Content-Type: `(QUERY STRING)`

| name         | type    | description                             | required? |
|--------------|---------|-----------------------------------------|-----------|
| stripPlanner | boolean | If true, `planner` property is omitted. | no        |
| stripUser    | boolean | See below.                              | no        |

If `stripUser` is true, the `owner` property in the `planner` property is
omitted. This option is effective only if `stripPlanner` is set to false.

## Response

This API responds with a list of `todo_list` objects on success.

----------------------------------------------------------------------

## POST `/planner/:id/todo-list`

## Description

Adds a new to-do list to the selected planner.

## Parameters

Content-Type: `application/x-www-form-urlencoded`

| name  | type   | description                 | required? |
|-------|--------|-----------------------------|-----------|
| title | string | Title of the new to-do list | yes       |

Content-Type: `(QUERY STRING)`

| name         | type    | description                             | required? |
|--------------|---------|-----------------------------------------|-----------|
| stripPlanner | boolean | If true, `planner` property is omitted. | no        |
| stripUser    | boolean | See below.                              | no        |

If `stripUser` is true, the `owner` property in the `planner` property is
omitted. This option is effective only if `stripPlanner` is set to false.

## Response

This API responds with a new `todo_list` item on success.

----------------------------------------------------------------------

## GET `/todo-list/:id`

## Description

Gets information of specified to-do list.

## Parameters

Content-Type: `(QUERY STRING)`

| name         | type    | description                             | required? |
|--------------|---------|-----------------------------------------|-----------|
| stripPlanner | boolean | If true, `planner` property is omitted. | no        |
| stripUser    | boolean | See below.                              | no        |

If `stripUser` is true, the `owner` property in the `planner` property is
omitted. This option is effective only if `stripPlanner` is set to false.

## Response

This API responds with a corresponding `todo_list` object on success.

----------------------------------------------------------------------

## PUT `/todo-list/:id`

## Description

Modifies information of specified to-do list.

## Parameters

Content-Type: `application/x-www-form-urlencoded`

| name  | type   | description                 | required? |
|-------|--------|-----------------------------|-----------|
| title | string | New title of the to-do list | no        |

Content-Type: `(QUERY STRING)`

| name         | type    | description                             | required? |
|--------------|---------|-----------------------------------------|-----------|
| stripPlanner | boolean | If true, `planner` property is omitted. | no        |
| stripUser    | boolean | See below.                              | no        |

If `stripUser` is true, the `owner` property in the `planner` property is
omitted. This option is effective only if `stripPlanner` is set to false.

## Response

This API responds with an updated `todo_list` object on success.

----------------------------------------------------------------------

## DELETE `/todo-list/:id`

## Description

Permanently deletes specified to-do list and its items.

## Parameters

None.

## Response

If the deletion was successful, this API responds with the following JSON:

```json
{
  "message": "to-do list deleted"
}
```
